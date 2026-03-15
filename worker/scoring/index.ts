import type { D1Database } from "@cloudflare/workers-types";
import { DRIVERS } from "@/App/driver";
import { SESSIONS } from "@/data/index";
import type { CircuitCode, DriverTag, PredictionContent, Session } from "@/shared/model";
import {
	getSessionResultCompleteness,
	getStoredSessionResultsBySessionKey,
	type SessionResultCompleteness,
	type StoredSessionResultRow,
	upsertScoringSessionResults,
} from "../queries/sessionResultQueries";
import { computeBonuses } from "./bonus";
import { SCORING_CONFIG } from "./config";
import { scoreGainersCategory, scoreLosersCategory } from "./gainersLosers";
import { driverNumberToTag } from "./helpers";
import { fetchNotionSessionResults } from "./notion";
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

type ScoreMapCache = {
	qualifyingResults: StoredSessionResultRow[];
	raceResults: StoredSessionResultRow[];
	updated_at: string;
};

type GainLossRankings = {
	gainersRanking: { driver: DriverTag; gainedLost: number }[];
	losersRanking: { driver: DriverTag; gainedLost: number }[];
	allDriverGains: Map<DriverTag, number>;
};

const forceRefetch = true;

export async function scoreRace(
	db: D1Database,
	scoreMap: R2Bucket,
	notionApiKey: string,
	circuitCode: string
): Promise<{ scored: number; results: UserRaceScore[] }> {
	const qualifyingSession = findSession(circuitCode, "Qualifying");
	const raceSession = findSession(circuitCode, "Race");

	if (!qualifyingSession || !raceSession) {
		throw new Error(`Could not find session keys for circuit: ${circuitCode}`);
	}

	const lockedPredictionsPromise = getLockedPredictions(db, circuitCode);
	const key = `${circuitCode}/${raceSession.session_key}`;
	const cachedScoreMap = await getCachedScoreMap(scoreMap, key);

	const { qualifyingResults, raceResults } =
		cachedScoreMap && !forceRefetch
			? cachedScoreMap
			: await regenerateScoreMap({
					db,
					scoreMap,
					notionApiKey,
					key,
					qualifyingSession,
					raceSession,
					forceRefetch,
				});

	const lockedPredictions = await lockedPredictionsPromise;

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
			username: prediction.username ?? "",
			circuitCode: circuitCode as CircuitCode,
			score: totalScore,
			exactMatches: totalExactMatches,
			breakdown,
			session_key: raceSession.session_key,
		};

		results.push(userScore);
	}

	await persistScores(db, circuitCode, results);

	return { scored: results.length, results };
}

function findSession(circuitCode: string, sessionType: string): Session | undefined {
	return SESSIONS.find(
		(s) =>
			s.circuit_code === circuitCode &&
			s.session_type === sessionType &&
			!s.session_name.toLowerCase().includes("sprint")
	);
}

async function regenerateScoreMap({
	db,
	scoreMap,
	notionApiKey,
	key,
	qualifyingSession,
	raceSession,
	forceRefetch = false,
}: {
	db: D1Database;
	scoreMap: R2Bucket;
	notionApiKey: string;
	key: string;
	qualifyingSession: Session;
	raceSession: Session;
	forceRefetch?: boolean;
}): Promise<ScoreMapCache> {
	const [qualifyingResults, raceResults] = await Promise.all([
		getSessionResultsWithBackfill(db, notionApiKey, qualifyingSession, forceRefetch),
		getSessionResultsWithBackfill(db, notionApiKey, raceSession, forceRefetch),
	]);

	const cache: ScoreMapCache = {
		qualifyingResults,
		raceResults,
		updated_at: new Date().toISOString(),
	};

	await scoreMap.put(key, JSON.stringify(cache));

	return cache;
}

async function getCachedScoreMap(scoreMap: R2Bucket, key: string): Promise<ScoreMapCache | null> {
	try {
		const cached = await scoreMap.get(key);
		if (!cached) return null;

		const value = await cached.json<ScoreMapCache>();
		const updatedAt = Date.parse(value.updated_at);
		if (Number.isNaN(updatedAt)) return null;

		if (Date.now() - updatedAt > 60 * 60 * 1000) {
			return null;
		}

		return value;
	} catch {
		return null;
	}
}

async function getSessionResultsWithBackfill(
	db: D1Database,
	notionApiKey: string,
	session: Session,
	forceRefetch = false
): Promise<StoredSessionResultRow[]> {
	const expectedCount = DRIVERS.length;

	const isComplete = (res: SessionResultCompleteness) => {
		if (res?.missing_position_count > 0) {
			return false;
		} else if (session.session_type !== "Race") {
			if (res.total_count !== expectedCount) {
				console.log(
					`[WARN] Qualifying session: ${session.circuit_code} missing results (${res.total_count}/${expectedCount})`
				);
			}
			return true;
		} else {
			return (
				res.total_count === expectedCount &&
				res.missing_starting_position_count === 0 &&
				res.missing_gained_lost_count === 0
			);
		}
	};

	const res = await getSessionResultCompleteness(db, session.session_key);

	if (isComplete(res) && !forceRefetch) {
		return getStoredSessionResultsBySessionKey(db, session.session_key);
	}

	const notionResults = await fetchNotionSessionResults(notionApiKey, session);
	await upsertScoringSessionResults(db, notionResults);

	const refreshedResults = await getStoredSessionResultsBySessionKey(db, session.session_key);
	const res2 = await getSessionResultCompleteness(db, session.session_key);
	if (!isComplete(res2)) {
		throw new Error(
			`Session results incomplete after Notion backfill for session ${session.session_key}`
		);
	}

	return refreshedResults;
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
	results: StoredSessionResultRow[],
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

function buildGainerLoserRankings(results: StoredSessionResultRow[]): GainLossRankings {
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
