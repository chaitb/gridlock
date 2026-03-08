import type { Context } from "hono";
import { z } from "zod";
import { getPredictionsByUserAndRace, lockPrediction } from "../queries/predictionQueries";
import type { AppEnv } from "../types";

const lockParamsSchema = z.object({
	circuitCode: z.string().trim().min(2),
});

export async function lockPredictionRoute(c: Context<AppEnv>) {
	const { env, req } = c;
	const userId = c.get("userId");

	const body = await req.json().catch(() => null);
	const parsed = lockParamsSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ message: "Invalid request", errors: parsed.error.issues }, 400);
	}

	const { circuitCode } = parsed.data;

	try {
		const existing = await getPredictionsByUserAndRace(env.F1_PREDICTIONS, userId, circuitCode);

		if (!existing?.prediction) {
			return c.json({ message: "No prediction found to lock" }, 404);
		}

		let parsedContent: { isComplete?: boolean } | null = null;
		try {
			parsedContent = JSON.parse(existing.prediction);
		} catch {
			// ignore
		}

		if (!parsedContent?.isComplete) {
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
