import type { D1Database } from "@cloudflare/workers-types";
import type { Prediction } from "@/shared/model";

export async function getPredictionsByUserAndRace(
	db: D1Database,
	userId: number,
	circuitCode: string
) {
	return db
		.prepare("SELECT * FROM predictions WHERE user_id = ? AND circuit_code = ?")
		.bind(userId, circuitCode)
		.first<Prediction>();
}

export async function getAllPredictionsByUser(db: D1Database, userId: number) {
	return db
		.prepare("SELECT * FROM predictions WHERE user_id = ? ORDER BY updated_at DESC")
		.bind(userId)
		.all<Prediction>();
}

export async function getAllLockedPredictionsByRace(db: D1Database, circuitCode: string) {
	return db
		.prepare(
			`SELECT p.id, p.user_id, p.circuit_code, p.prediction, p.created_at, p.updated_at, u.username
			 FROM predictions p
			 JOIN players u ON p.user_id = u.id
			 WHERE p.circuit_code = ?
			 AND p.locked = 1
			 ORDER BY p.updated_at DESC`
		)
		.bind(circuitCode)
		.all();
}

export async function lockPrediction(db: D1Database, userId: number, circuitCode: string) {
	return db
		.prepare(
			`UPDATE predictions SET locked = 1, updated_at = CURRENT_TIMESTAMP
			 WHERE user_id = ? AND circuit_code = ?`
		)
		.bind(userId, circuitCode)
		.run();
}

export async function upsertPrediction(
	db: D1Database,
	userId: number,
	circuitCode: string,
	prediction: string
) {
	return db
		.prepare(
			`INSERT INTO predictions (user_id, circuit_code, prediction)
			 VALUES (?, ?, ?)
			 ON CONFLICT (user_id, circuit_code)
			 DO UPDATE SET prediction = excluded.prediction, updated_at = CURRENT_TIMESTAMP RETURNING updated_at`
		)
		.bind(userId, circuitCode, prediction)
		.run();
}
