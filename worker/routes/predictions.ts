import type { Context } from "hono";
import { savePredictionsSchema } from "../../src/model";
import { getPredictionsByUserAndRace, upsertPrediction } from "../queries/predictionQueries";
import type { AppEnv } from "../types";
import { z } from "zod";

const getParamsSchema = z.object({
	circuitCode: z.string().trim().min(2),
});

export async function getPredictions(c: Context<AppEnv>) {
	const { env } = c;
	const userId = c.get("userId");

	const circuitCode = c.req.query("circuitCode");
	const parsed = getParamsSchema.safeParse({ circuitCode });
	if (!parsed.success) {
		return c.json({ message: "Invalid request", errors: parsed.error.issues }, 400);
	}

	try {
		const result = await getPredictionsByUserAndRace(
			env.F1_PREDICTIONS,
			userId,
			parsed.data.circuitCode
		);

		return c.json(result);
	} catch (error) {
		console.error("[predictions] unexpected error", error);
		return c.json({ message: "Database error" }, 500);
	}
}

export async function savePredictions(c: Context<AppEnv>) {
	const { env, req } = c;
	const userId = c.get("userId");

	const body = await req.json().catch(() => null);
	const parsed = savePredictionsSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ message: "Invalid request", errors: parsed.error.issues }, 400);
	}

	const { circuitCode, predictions, isComplete } = parsed.data;
	const predictionJson = JSON.stringify({ ...predictions, isComplete });

	try {
		const result = await upsertPrediction(env.F1_PREDICTIONS, userId, circuitCode, predictionJson);

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
