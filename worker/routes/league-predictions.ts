import type { Context } from "hono";
import {
	getAllLockedPredictionsByRace,
	getPredictionsByUserAndRace,
} from "../queries/predictionQueries";
import type { AppEnv } from "../types";

export async function getLeaguePredictions(c: Context<AppEnv>) {
	const { env } = c;
	// Requesting user's identity comes from the verified session cookie
	const userId = c.get("userId");

	const circuitCode = c.req.query("circuitCode");
	if (!circuitCode) {
		return c.json({ message: "Missing circuitCode" }, 400);
	}

	try {
		const userPrediction = await getPredictionsByUserAndRace(
			env.F1_PREDICTIONS,
			userId,
			circuitCode
		);

		if (!userPrediction?.prediction) {
			return c.json(
				{
					message: "You must submit your predictions first",
					code: "PREDICTION_REQUIRED",
				},
				403
			);
		}

		if (!userPrediction.locked) {
			return c.json(
				{
					message: "Lock your predictions to view the league",
					code: "PREDICTION_INCOMPLETE",
				},
				403
			);
		}

		const result = await getAllLockedPredictionsByRace(env.F1_PREDICTIONS, circuitCode);

		return c.json({ predictions: result.results });
	} catch (error) {
		console.error("[league-predictions] unexpected error", error);
		return c.json({ message: "Database error" }, 500);
	}
}
