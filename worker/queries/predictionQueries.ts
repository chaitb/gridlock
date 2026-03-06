import type { D1Database } from "@cloudflare/workers-types";
import type { Prediction } from "../../src/model";

export async function getPredictionsByUserAndRace(
	db: D1Database,
	userId: number,
	raceCode: string
) {
	return db
		.prepare("SELECT * FROM predictions WHERE user_id = ? AND race_code = ?")
		.bind(userId, raceCode)
		.first<Prediction>();
}

export async function upsertPrediction(
	db: D1Database,
	userId: number,
	raceCode: string,
	prediction: string
) {
	return db
		.prepare(
			`INSERT INTO predictions (user_id, race_code, prediction)
			 VALUES (?, ?, ?)
			 ON CONFLICT (user_id, race_code)
			 DO UPDATE SET prediction = excluded.prediction, updated_at = CURRENT_TIMESTAMP RETURNING updated_at`
		)
		.bind(userId, raceCode, prediction)
		.run();
}
