import type { Context } from "hono";
import { getAllPredictionsByUser, getPredictionsByUserAndRace } from "../queries/predictionQueries";
import { findUserByUsernameOrEmail } from "../queries/userQueries";

export async function getUserPredictions(c: Context) {
	const { env } = c;
	if (!env.F1_PREDICTIONS) {
		return c.json({ message: "D1 binding missing" }, 500);
	}

	const username = c.req.query("username");
	const requestingUser = c.req.query("requestingUser");

	if (!username) {
		return c.json({ message: "Missing username" }, 400);
	}

	try {
		const targetUser = await findUserByUsernameOrEmail(env.F1_PREDICTIONS, username);
		if (!targetUser) {
			return c.json({ message: "User not found" }, 404);
		}

		const result = await getAllPredictionsByUser(env.F1_PREDICTIONS, targetUser.id);
		const predictions = result.results;

		// If no requesting user or same user, return all predictions as owner
		if (!requestingUser || requestingUser === username) {
			return c.json({
				predictions,
				isOwner: true,
			});
		}

		// Different user - check access per race
		const requestingUserData = await findUserByUsernameOrEmail(env.F1_PREDICTIONS, requestingUser);
		if (!requestingUserData) {
			return c.json({ message: "Requesting user not found" }, 401);
		}

		const availablePredictions: typeof predictions = [];
		const unavailableRaces: string[] = [];

		for (const pred of predictions) {
			const requestingPred = await getPredictionsByUserAndRace(
				env.F1_PREDICTIONS,
				requestingUserData.id,
				pred.circuit_code
			);

			if (!requestingPred?.prediction || !requestingPred.locked) {
				unavailableRaces.push(pred.circuit_code);
				continue;
			}

			availablePredictions.push(pred);
		}

		if (unavailableRaces.length > 0) {
			return c.json(
				{
					message: "Submit your predictions to view this user's picks for those races",
					code: "user_no_prediction",
					unavailableRaces,
					predictions: availablePredictions,
					isOwner: false,
				},
				200
			);
		}

		return c.json({
			predictions: availablePredictions,
			isOwner: false,
		});
	} catch (error) {
		console.error("[user-predictions] unexpected error", error);
		return c.json({ message: "Database error" }, 500);
	}
}
