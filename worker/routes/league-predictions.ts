import type { Context } from "hono";
import {
	getAllLockedPredictionsByRace,
	getPredictionsByUserAndRace,
} from "../queries/predictionQueries";
import { findUserByUsernameOrEmail } from "../queries/userQueries";

export async function getLeaguePredictions(c: Context) {
	const { env } = c;
	if (!env.F1_PREDICTIONS) {
		return c.json({ message: "D1 binding missing" }, 500);
	}

	const username = c.req.query("userId");
	const circuitCode = c.req.query("circuitCode");

	if (!username || !circuitCode) {
		return c.json({ message: "Missing userId or circuitCode" }, 400);
	}

	try {
		const user = await findUserByUsernameOrEmail(env.F1_PREDICTIONS, username);
		if (!user) {
			return c.json({ message: "User not found" }, 404);
		}

		const userPrediction = await getPredictionsByUserAndRace(
			env.F1_PREDICTIONS,
			user.id,
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
