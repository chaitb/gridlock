import type { Context } from "hono";
import { RACES_2026 } from "../../src/data";
import {
	getAllLockedPredictionsByRace,
	getPredictionsByUserAndRace,
} from "../queries/predictionQueries";
import { findUserByUsernameOrEmail } from "../queries/userQueries";
import type { AppEnv } from "../types";

export async function getLeaguePredictions(c: Context<AppEnv>) {
	const { env } = c;
	const userId = c.get("userId");

	const circuitCode = c.req.query("circuitCode");
	const username = c.req.query("username");

	if (!circuitCode) {
		return c.json({ message: "Missing circuitCode" }, 400);
	}

	const race = RACES_2026.find((r) => r.circuit_code === circuitCode);
	if (!race) {
		return c.json({ message: "Race not found" }, 404);
	}

	const lockDate = race.getPredictionLockDate();
	const isLocked = lockDate < new Date();

	if (!isLocked) {
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
	}

	if (username) {
		const targetUser = await findUserByUsernameOrEmail(env.F1_PREDICTIONS, username);
		if (!targetUser) {
			return c.json({ message: "User not found" }, 404);
		}

		const userPrediction = await getPredictionsByUserAndRace(
			env.F1_PREDICTIONS,
			targetUser.id,
			circuitCode
		);

		if (!userPrediction || !userPrediction.locked) {
			return c.json({ predictions: [] });
		}

		return c.json({
			predictions: [
				{
					...userPrediction,
					username: targetUser.username,
				},
			],
		});
	}

	const result = await getAllLockedPredictionsByRace(env.F1_PREDICTIONS, circuitCode);

	return c.json({ predictions: result.results });
}
