import type { D1Database } from "@cloudflare/workers-types";

type PlayerScore = {
	id: number;
	user_id: number;
	season: string;
	league: string;
	total_score: number;
	total_exact_matches: number;
	races_scored: number;
	created_at: string;
	updated_at: string;
};

type RaceScoreRow = {
	user_id: number;
	username: string | null;
	circuit_code: string;
	score: number;
	exact_matches: number;
	breakdown: string | null;
	updated_at: string;
};

export async function getScoresByCircuit(
	db: D1Database,
	circuitCode: string
): Promise<RaceScoreRow[]> {
	const results = await db
		.prepare(
			`SELECT p.user_id, u.username, p.circuit_code, p.score, p.exact_matches, p.breakdown, p.updated_at
			 FROM predictions p
			 JOIN players u ON p.user_id = u.id
			 WHERE p.circuit_code = ?
			   AND p.locked = 1
			   AND p.score IS NOT NULL
			 ORDER BY p.score DESC`
		)
		.bind(circuitCode)
		.all<RaceScoreRow>();

	return results.results;
}

export async function getScoreByUserAndCircuit(
	db: D1Database,
	userId: number,
	circuitCode: string
): Promise<RaceScoreRow | null> {
	return db
		.prepare(
			`SELECT p.user_id, u.username, p.circuit_code, p.score, p.exact_matches, p.breakdown, p.updated_at
			 FROM predictions p
			 JOIN players u ON p.user_id = u.id
			 WHERE p.user_id = ? AND p.circuit_code = ? AND p.score IS NOT NULL`
		)
		.bind(userId, circuitCode)
		.first<RaceScoreRow>();
}

export async function getScoreByUsernameAndCircuit(
	db: D1Database,
	username: string,
	circuitCode: string
): Promise<RaceScoreRow | null> {
	return db
		.prepare(
			`SELECT p.user_id, u.username, p.circuit_code, p.score, p.exact_matches, p.breakdown, p.updated_at
			 FROM predictions p
			 JOIN players u ON p.user_id = u.id
			 WHERE u.username = ? AND p.circuit_code = ? AND p.score IS NOT NULL`
		)
		.bind(username, circuitCode)
		.first<RaceScoreRow>();
}

export async function getSeasonScores(
	db: D1Database,
	season: string = "f1_2026",
	league: string = "global"
): Promise<PlayerScore[]> {
	const results = await db
		.prepare(
			`SELECT *
			 FROM player_scores
			 WHERE season = ? AND league = ?
			 ORDER BY total_score DESC`
		)
		.bind(season, league)
		.all<PlayerScore>();

	return results.results;
}

export async function hasScoresForCircuit(db: D1Database, circuitCode: string): Promise<boolean> {
	const result = await db
		.prepare("SELECT 1 FROM predictions WHERE circuit_code = ? AND score IS NOT NULL LIMIT 1")
		.bind(circuitCode)
		.first();

	return result !== null;
}
