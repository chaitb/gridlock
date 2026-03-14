import type { D1Database } from "@cloudflare/workers-types";
import type { SessionResult } from "@/shared/model";

type StoredSessionResult = {
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
	duration: string | null;
	gap_to_leader: string | null;
	created_at: string;
	updated_at: string;
};

function toSessionResult(stored: StoredSessionResult): SessionResult {
	return {
		position: stored.position,
		driver_number: stored.driver_number,
		number_of_laps: stored.number_of_laps,
		points: stored.points ?? undefined,
		dnf: stored.dnf === 1,
		dns: stored.dns === 1,
		dsq: stored.dsq === 1,
		starting_position: stored.starting_position ?? undefined,
		duration: stored.duration ? parseFloat(stored.duration) : null,
		gap_to_leader: stored.gap_to_leader,
		meeting_key: stored.meeting_key,
		session_key: stored.session_key,
	};
}

export async function getSessionResultsBySessionKey(
	db: D1Database,
	sessionKey: number
): Promise<SessionResult[]> {
	const results = await db
		.prepare("SELECT * FROM session_results WHERE session_key = ? ORDER BY position ASC")
		.bind(sessionKey)
		.all<StoredSessionResult>();

	return results.results.map(toSessionResult);
}

export async function insertSessionResults(
	db: D1Database,
	results: SessionResult[]
): Promise<void> {
	if (results.length === 0) return;

	const stmt = db.prepare(`
		INSERT INTO session_results (
			session_key, meeting_key, driver_number, position, number_of_laps,
			points, dnf, dns, dsq, starting_position, duration, gap_to_leader
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(session_key, driver_number) DO UPDATE SET
			position = excluded.position,
			number_of_laps = excluded.number_of_laps,
			points = excluded.points,
			dnf = excluded.dnf,
			dns = excluded.dns,
			dsq = excluded.dsq,
			starting_position = excluded.starting_position,
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
		.all<StoredSessionResult>();

	return results.results.map(toSessionResult);
}
