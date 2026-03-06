import type { Context } from "hono";
import { getPredictionsSchema, savePredictionsSchema } from "../../src/model";
import { getPredictionsByUserAndRace, upsertPrediction } from "../queries/predictionQueries";
import { findUserByUsernameOrEmail } from "../queries/userQueries";

export async function getPredictions(c: Context) {
	const { env } = c;
	if (!env.F1_PREDICTIONS) {
		return c.json({ message: "D1 binding missing" }, 500);
	}

	const userId = c.req.query("userId");
	const raceCode = c.req.query("raceCode");
	const parsed = getPredictionsSchema.safeParse({ userId, raceCode });
	if (!parsed.success) {
		return c.json({ message: "Invalid request", errors: parsed.error.issues }, 400);
	}

	try {
		const user = await findUserByUsernameOrEmail(env.F1_PREDICTIONS, userId);
		if (!user) {
			return c.json({ message: "User not found" }, 401);
		}

		const result = await getPredictionsByUserAndRace(
			env.F1_PREDICTIONS,
			user.id,
			parsed.data.raceCode
		);

		return c.json(result);
	} catch (error) {
		console.error("[predictions] unexpected error", error);
		return c.json({ message: "Database error" }, 500);
	}
}

export async function savePredictions(c: Context) {
	const { env, req } = c;
	if (!env.F1_PREDICTIONS) {
		return c.json({ message: "D1 binding missing" }, 500);
	}

	const body = await req.json().catch(() => null);
	const parsed = savePredictionsSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ message: "Invalid request", errors: parsed.error.issues }, 400);
	}

	const { userId, raceCode, predictions, isComplete } = parsed.data;
	const predictionJson = JSON.stringify({ ...predictions, isComplete });

	try {
		const result = await upsertPrediction(env.F1_PREDICTIONS, userId, raceCode, predictionJson);

		if (!result.success) {
			return c.json({ message: "Failed to save prediction" }, 500);
		}

		return c.json({
			message: "Prediction saved",
			updated_at: result.results[0].updated_at,
		});
	} catch (error) {
		console.error("[save-predictions] unexpected error", error);
		return c.json({ message: "Database error" }, 500);
	}
}
