import type { D1Database } from "@cloudflare/workers-types";
import type { User } from "../../src/model";

export async function findUserByEmail(db: D1Database, email: string) {
	return db.prepare("SELECT * FROM players WHERE email = ?").bind(email).run();
}

export async function findUserByUsernameOrEmail(
	db: D1Database,
	username?: string,
	email?: string
): Promise<User | null> {
	if (!username && !email) {
		return null;
	}
	if (username) {
		return db
			.prepare("SELECT * FROM players WHERE username = ? LIMIT 1")
			.bind(username)
			.first<User>();
	}
	if (email) {
		return db.prepare("SELECT * FROM players WHERE email = ? LIMIT 1").bind(email).first<User>();
	}
	return null;
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
			`SELECT username, COALESCE(points, 0) AS points,
			        ROW_NUMBER() OVER (ORDER BY COALESCE(points, 0) DESC) AS rank
			 FROM players
			 WHERE username IS NOT NULL
			 ORDER BY points DESC`
		)
		.all();
}
