import type { D1Database } from "@cloudflare/workers-types";
import type { SessionResult } from "@/shared/model";

export type StoredSessionResultRow = {
	id: number;
	session_key: number;
	meeting_key: number;
	driver_number: number;
	position: number | null;
	number_of_laps: number;
	points: number | null;
	dnf: number;
	dns: number;
	dsq: number;
	starting_position: number | null;
	gained_lost: number | null;
	duration: string | null;
	gap_to_leader: string | null;
	created_at: string;
	updated_at: string;
};

export type SessionResultCompleteness = {
	total_count: number;
	missing_position_count: number;
	missing_starting_position_count: number;
	missing_gained_lost_count: number;
};

export type ScoringSessionResultRow = {
	session_key: number;
	meeting_key: number;
	driver_number: number;
	position: number | null;
	dnf: boolean;
	dns: boolean;
	dsq: boolean;
	starting_position: number | null;
	gained_lost: number | null;
};

function toSessionResult(stored: StoredSessionResultRow): SessionResult {
	return {
		position: stored.position,
		driver_number: stored.driver_number,
		number_of_laps: stored.number_of_laps,
		points: stored.points ?? undefined,
		dnf: stored.dnf === 1,
		dns: stored.dns === 1,
		dsq: stored.dsq === 1,
		starting_position: stored.starting_position ?? undefined,
		gained_lost: stored.gained_lost ?? undefined,
		duration: stored.duration ? parseFloat(stored.duration) : null,
		gap_to_leader: stored.gap_to_leader,
		meeting_key: stored.meeting_key,
		session_key: stored.session_key,
	};
}

export async function getStoredSessionResultsBySessionKey(
	db: D1Database,
	sessionKey: number
): Promise<StoredSessionResultRow[]> {
	const results = await db
		.prepare("SELECT * FROM session_results WHERE session_key = ? ORDER BY position ASC")
		.bind(sessionKey)
		.all<StoredSessionResultRow>();

	return results.results;
}

export async function getSessionResultsBySessionKey(
	db: D1Database,
	sessionKey: number
): Promise<SessionResult[]> {
	const results = await getStoredSessionResultsBySessionKey(db, sessionKey);
	return results.map(toSessionResult);
}

export async function insertSessionResults(
	db: D1Database,
	results: SessionResult[]
): Promise<void> {
	if (results.length === 0) return;

	const stmt = db.prepare(`
		INSERT INTO session_results (
			session_key, meeting_key, driver_number, position, number_of_laps,
			points, dnf, dns, dsq, starting_position, gained_lost, duration, gap_to_leader
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(session_key, driver_number) DO UPDATE SET
			position = excluded.position,
			number_of_laps = excluded.number_of_laps,
			points = excluded.points,
			dnf = excluded.dnf,
			dns = excluded.dns,
			dsq = excluded.dsq,
			starting_position = excluded.starting_position,
			gained_lost = COALESCE(excluded.gained_lost, session_results.gained_lost),
			duration = excluded.duration,
			gap_to_leader = excluded.gap_to_leader,
			updated_at = CURRENT_TIMESTAMP
	`);

	const batch = results.map((r) =>
		stmt.bind(
			r.session_key,
			r.meeting_key,
			r.driver_number,
			r.position ?? null,
			r.number_of_laps,
			r.points ?? null,
			r.dnf ? 1 : 0,
			r.dns ? 1 : 0,
			r.dsq ? 1 : 0,
			r.starting_position ?? null,
			r.gained_lost ?? null,
			r.duration?.toString() ?? null,
			r.gap_to_leader?.toString() ?? null
		)
	);

	await db.batch(batch);
}

export async function hasSessionResults(db: D1Database, sessionKey: number): Promise<boolean> {
	const result = await db
		.prepare("SELECT 1 FROM session_results WHERE session_key = ? LIMIT 1")
		.bind(sessionKey)
		.first();

	return result !== null;
}

export async function getSessionResultCompleteness(
	db: D1Database,
	sessionKey: number
): Promise<SessionResultCompleteness> {
	const stats = await db
		.prepare(
			`SELECT
				COUNT(*) AS total_count,
				SUM(
					CASE WHEN position IS NULL
						AND dnf = 0 AND dns = 0 AND dsq = 0
						THEN 1 ELSE 0 END)
					AS missing_position_count,
				SUM(
					CASE WHEN starting_position IS NULL
						THEN 1
						ELSE 0 END)
					AS missing_starting_position_count,
				SUM(
					CASE WHEN gained_lost IS NULL
						THEN 1
						ELSE 0 END)
					AS missing_gained_lost_count
			 FROM session_results
			 WHERE session_key = ?`
		)
		.bind(sessionKey)
		.first<SessionResultCompleteness>();

	return {
		total_count: stats?.total_count ?? 0,
		missing_position_count: stats?.missing_position_count ?? 0,
		missing_starting_position_count: stats?.missing_starting_position_count ?? 0,
		missing_gained_lost_count: stats?.missing_gained_lost_count ?? 0,
	};
}

export async function upsertScoringSessionResults(
	db: D1Database,
	results: ScoringSessionResultRow[]
): Promise<void> {
	if (results.length === 0) return;

	const stmt = db.prepare(`
		INSERT INTO session_results (
			session_key,
			meeting_key,
			driver_number,
			position,
			number_of_laps,
			points,
			dnf,
			dns,
			dsq,
			starting_position,
			gained_lost,
			duration,
			gap_to_leader
		) VALUES (?, ?, ?, ?, 0, NULL, ?, ?, ?, ?, ?, NULL, NULL)
		ON CONFLICT(session_key, driver_number) DO UPDATE SET
			position = COALESCE(excluded.position, session_results.position),
			dnf = excluded.dnf,
			dns = excluded.dns,
			dsq = excluded.dsq,
			starting_position = COALESCE(excluded.starting_position, session_results.starting_position),
			gained_lost = COALESCE(excluded.gained_lost, session_results.gained_lost),
			updated_at = CURRENT_TIMESTAMP
	`);

	const batch = results.map((result) =>
		stmt.bind(
			result.session_key,
			result.meeting_key,
			result.driver_number,
			result.position,
			result.dnf ? 1 : 0,
			result.dns ? 1 : 0,
			result.dsq ? 1 : 0,
			result.starting_position,
			result.gained_lost
		)
	);

	await db.batch(batch);
}

export async function getSessionResultsByDriver(
	db: D1Database,
	driverNumber: number
): Promise<SessionResult[]> {
	const results = await db
		.prepare(
			`SELECT * FROM session_results
			 WHERE driver_number = ?
			 ORDER BY session_key DESC`
		)
		.bind(driverNumber)
		.all<StoredSessionResultRow>();

	return results.results.map(toSessionResult);
}
