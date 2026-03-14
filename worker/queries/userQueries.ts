import type { D1Database } from "@cloudflare/workers-types";
import type { User } from "@/shared/model";

export async function findUserByEmail(db: D1Database, email: string) {
	return db.prepare("SELECT * FROM players WHERE email = ?").bind(email).run();
}

export async function findUserById(db: D1Database, id: number): Promise<User | null> {
	return db.prepare("SELECT * FROM players WHERE id = ? LIMIT 1").bind(id).first<User>();
}

export async function setVerifiedAt(db: D1Database, id: number) {
	return db
		.prepare(
			"UPDATE players SET verified_at = CURRENT_TIMESTAMP WHERE id = ? AND verified_at IS NULL"
		)
		.bind(id)
		.run();
}

export async function findUserByUsernameOrEmail(
	db: D1Database,
	username?: string,
	email?: string
): Promise<User | null> {
	if (!username && !email) {
		return null;
	}
	// When both are provided (e.g. during account creation), check for either conflict
	// in a single query so an existing email with a different username is still caught.
	if (username && email) {
		return db
			.prepare("SELECT * FROM players WHERE username = ? OR email = ? LIMIT 1")
			.bind(username, email)
			.first<User>();
	}
	if (username) {
		return db
			.prepare("SELECT * FROM players WHERE username = ? LIMIT 1")
			.bind(username)
			.first<User>();
	}
	// email only
	return db.prepare("SELECT * FROM players WHERE email = ? LIMIT 1").bind(email).first<User>();
}

export async function createUser(db: D1Database, username: string, email: string) {
	return db
		.prepare("INSERT INTO players (username, email) VALUES (?, ?)")
		.bind(username, email)
		.run();
}

export async function findUsernameConflict(db: D1Database, username: string, excludeId: number) {
	return db
		.prepare("SELECT id FROM players WHERE username = ? AND id != ? LIMIT 1")
		.bind(username, excludeId)
		.first();
}

export async function updateUserUsername(db: D1Database, username: string, id: number) {
	return db
		.prepare("UPDATE players SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
		.bind(username, id)
		.run();
}

export async function getLeaderboard(db: D1Database) {
	return db
		.prepare(
			`SELECT p.username,
			        COALESCE(ps.total_score, 0) AS points,
			        ROW_NUMBER() OVER (ORDER BY COALESCE(ps.total_score, 0) DESC) AS rank
			 FROM players p
			 LEFT JOIN player_scores ps ON ps.user_id = p.id
			   AND ps.season = 'f1_2026' AND ps.league = 'global'
			 WHERE p.username IS NOT NULL
			 ORDER BY points DESC`
		)
		.all();
}

export async function getVerifiedUsersWithoutLockedPrediction(
	db: D1Database,
	circuitCode: string
): Promise<{ id: number; email: string; username: string | null }[]> {
	return db
		.prepare(
			`SELECT p.id, p.email, p.username
			 FROM players p
			 WHERE p.verified_at IS NOT NULL
			 AND NOT EXISTS (
				 SELECT 1 FROM predictions pred
				 WHERE pred.user_id = p.id
				 AND pred.circuit_code = ?
				 AND pred.locked = 1
			 )`
		)
		.bind(circuitCode)
		.all<{ id: number; email: string; username: string | null }>()
		.then((result) => result.results);
}

export async function getAllUsers(db: D1Database): Promise<User[]> {
	const result = await db.prepare("SELECT * FROM players ORDER BY created_at DESC").all<User>();
	return result.results ?? [];
}
