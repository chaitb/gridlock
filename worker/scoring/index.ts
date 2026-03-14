import type { D1Database } from "@cloudflare/workers-types";
import { SESSIONS } from "@/data/index";
import type { DriverTag, PredictionContent } from "@/shared/model";
import { computeBonuses } from "./bonus";
import { SCORING_CONFIG } from "./config";
import { scoreGainersCategory, scoreLosersCategory } from "./gainersLosers";
import { driverNumberToTag } from "./helpers";
import { scorePositionCategory } from "./position";
import type { ScoreBreakdown, UserRaceScore } from "./types";

type LockedPrediction = {
	id: number;
	user_id: number;
	circuit_code: string;
	prediction: string | null;
	created_at: string;
	updated_at: string;
	username: string | null;
};

type StoredSessionResult = {
	driver_number: number;
	position: number | null;
	dnf: number;
	dns: number;
	dsq: number;
	starting_position: number | null;
	gained_lost: number | null;
};

export async function scoreRace(
	db: D1Database,
	circuitCode: string
): Promise<{ scored: number; results: UserRaceScore[] }> {
	const qualifyingSessionKey = findSessionKey(circuitCode, "Qualifying");
	const raceSessionKey = findSessionKey(circuitCode, "Race");

	if (!qualifyingSessionKey || !raceSessionKey) {
		throw new Error(`Could not find session keys for circuit: ${circuitCode}`);
	}

	const [qualifyingResults, raceResults, lockedPredictions] = await Promise.all([
		getSessionResults(db, qualifyingSessionKey),
		getSessionResults(db, raceSessionKey),
		getLockedPredictions(db, circuitCode),
	]);

	if (qualifyingResults.length === 0 || raceResults.length === 0) {
		throw new Error(`Session results not available for circuit: ${circuitCode}`);
	}

	const totalDrivers = raceResults.length;

	const qualifyingMap = buildPositionMap(qualifyingResults, totalDrivers);
	const raceMap = buildPositionMap(raceResults, totalDrivers);
	const { gainersRanking, losersRanking, allDriverGains } = buildGainerLoserRankings(raceResults);

	const results: UserRaceScore[] = [];

	for (const prediction of lockedPredictions) {
		if (!prediction.prediction) continue;

		const content: PredictionContent = JSON.parse(prediction.prediction);

		const qualifying = scorePositionCategory(
			content.qualifying,
			qualifyingMap,
			SCORING_CONFIG.qualifying.tiers,
			totalDrivers
		);

		const race = scorePositionCategory(
			content.race,
			raceMap,
			SCORING_CONFIG.race.tiers,
			totalDrivers
		);

		const gainers = scoreGainersCategory(
			content.gainers,
			gainersRanking,
			allDriverGains,
			SCORING_CONFIG.gainers.tiers
		);

		const losers = scoreLosersCategory(
			content.losers,
			losersRanking,
			allDriverGains,
			SCORING_CONFIG.losers.tiers
		);

		const totalExactMatches =
			qualifying.exactMatches + race.exactMatches + gainers.exactMatches + losers.exactMatches;

		const bonuses = await computeBonuses(
			db,
			prediction.user_id,
			circuitCode,
			totalExactMatches > 0
		);

		const bonusPoints = bonuses.reduce((sum, b) => sum + b.points, 0);

		const breakdown: ScoreBreakdown = {
			qualifying: qualifying.scores,
			race: race.scores,
			gainers: gainers.scores,
			losers: losers.scores,
			bonuses,
		};

		const totalScore = qualifying.total + race.total + gainers.total + losers.total + bonusPoints;

		const userScore: UserRaceScore = {
			userId: prediction.user_id,
			circuitCode,
			score: totalScore,
			exactMatches: totalExactMatches,
			breakdown,
		};

		results.push(userScore);
	}

	await persistScores(db, circuitCode, results);

	return { scored: results.length, results };
}

function findSessionKey(circuitCode: string, sessionType: string): number | undefined {
	const session = SESSIONS.find(
		(s) =>
			s.circuit_code === circuitCode &&
			s.session_type === sessionType &&
			!s.session_name.toLowerCase().includes("sprint")
	);
	return session?.session_key;
}

async function getSessionResults(
	db: D1Database,
	sessionKey: number
): Promise<StoredSessionResult[]> {
	const results = await db
		.prepare(
			`SELECT driver_number, position, dnf, dns, dsq, starting_position, gained_lost
			 FROM session_results
			 WHERE session_key = ?
			 ORDER BY position ASC`
		)
		.bind(sessionKey)
		.all<StoredSessionResult>();

	return results.results;
}

async function getLockedPredictions(
	db: D1Database,
	circuitCode: string
): Promise<LockedPrediction[]> {
	const results = await db
		.prepare(
			`SELECT p.id, p.user_id, p.circuit_code, p.prediction, p.created_at, p.updated_at, u.username
			 FROM predictions p
			 JOIN players u ON p.user_id = u.id
			 WHERE p.circuit_code = ?
			 AND p.locked = 1`
		)
		.bind(circuitCode)
		.all<LockedPrediction>();

	return results.results;
}

function buildPositionMap(
	results: StoredSessionResult[],
	totalDrivers: number
): Map<DriverTag, { position: number; dnf: boolean }> {
	const map = new Map<DriverTag, { position: number; dnf: boolean }>();

	for (const r of results) {
		const tag = driverNumberToTag(r.driver_number);
		if (!tag) continue;

		const dnf = r.dnf === 1 || r.dns === 1 || r.dsq === 1;
		const position = dnf || r.position === null ? totalDrivers : r.position;

		map.set(tag, { position, dnf });
	}

	return map;
}

function buildGainerLoserRankings(results: StoredSessionResult[]): {
	gainersRanking: { driver: DriverTag; gainedLost: number }[];
	losersRanking: { driver: DriverTag; gainedLost: number }[];
	allDriverGains: Map<DriverTag, number>;
} {
	const allDriverGains = new Map<DriverTag, number>();
	const driverGainList: { driver: DriverTag; gainedLost: number }[] = [];

	for (const r of results) {
		const tag = driverNumberToTag(r.driver_number);
		if (!tag) continue;

		const gainedLost = r.gained_lost ?? 0;
		allDriverGains.set(tag, gainedLost);
		driverGainList.push({ driver: tag, gainedLost });
	}

	const gainersRanking = [...driverGainList].sort((a, b) => b.gainedLost - a.gainedLost);

	const losersRanking = [...driverGainList].sort((a, b) => a.gainedLost - b.gainedLost);

	return { gainersRanking, losersRanking, allDriverGains };
}

async function persistScores(
	db: D1Database,
	circuitCode: string,
	results: UserRaceScore[]
): Promise<void> {
	const updatePrediction = db.prepare(
		`UPDATE predictions
		 SET score = ?, exact_matches = ?, breakdown = ?, updated_at = CURRENT_TIMESTAMP
		 WHERE user_id = ? AND circuit_code = ?`
	);

	const predictionBatch = results.map((result) =>
		updatePrediction.bind(
			result.score,
			result.exactMatches,
			JSON.stringify(result.breakdown),
			result.userId,
			circuitCode
		)
	);

	if (predictionBatch.length > 0) {
		await db.batch(predictionBatch);
	}

	await recalculatePlayerScores(db, results);
}

async function recalculatePlayerScores(db: D1Database, results: UserRaceScore[]): Promise<void> {
	const upsertStmt = db.prepare(
		`INSERT INTO player_scores (user_id, season, league, total_score, total_exact_matches, races_scored)
		 SELECT
			?,
			'f1_2026',
			'global',
			COALESCE(SUM(score), 0),
			COALESCE(SUM(exact_matches), 0),
			COUNT(score)
		 FROM predictions
		 WHERE user_id = ? AND score IS NOT NULL
		 ON CONFLICT(user_id, season, league) DO UPDATE SET
			total_score = excluded.total_score,
			total_exact_matches = excluded.total_exact_matches,
			races_scored = excluded.races_scored,
			updated_at = CURRENT_TIMESTAMP`
	);

	const batch = results.map((r) => upsertStmt.bind(r.userId, r.userId));

	if (batch.length > 0) {
		await db.batch(batch);
	}
}
