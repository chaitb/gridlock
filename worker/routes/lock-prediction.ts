import type { Context } from "hono";
import { lockPredictionSchema } from "../../src/model";
import { getPredictionsByUserAndRace, lockPrediction } from "../queries/predictionQueries";

export async function lockPredictionRoute(c: Context) {
	const { env, req } = c;
	if (!env.F1_PREDICTIONS) {
		return c.json({ message: "D1 binding missing" }, 500);
	}

	const body = await req.json().catch(() => null);
	const parsed = lockPredictionSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ message: "Invalid request", errors: parsed.error.issues }, 400);
	}

	const { userId, circuitCode } = parsed.data;

	try {
		const existing = await getPredictionsByUserAndRace(env.F1_PREDICTIONS, userId, circuitCode);

		if (!existing?.prediction) {
			return c.json({ message: "No prediction found to lock" }, 404);
		}

		let parsed_content: { isComplete?: boolean } | null = null;
		try {
			parsed_content = JSON.parse(existing.prediction);
		} catch {
			// ignore
		}

		if (!parsed_content?.isComplete) {
			return c.json(
				{ message: "Prediction must be complete before locking", code: "PREDICTION_INCOMPLETE" },
				400
			);
		}

		if (existing.locked === 1) {
			return c.json({ message: "Prediction is already locked" }, 409);
		}

		const result = await lockPrediction(env.F1_PREDICTIONS, userId, circuitCode);

		if (!result.success) {
			return c.json({ message: "Failed to lock prediction" }, 500);
		}

		return c.json({ message: "Prediction locked" });
	} catch (error) {
		console.error("[lock-prediction] unexpected error", error);
		return c.json({ message: "Database error" }, 500);
	}
}
