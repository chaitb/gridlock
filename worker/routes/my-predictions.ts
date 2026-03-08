import type { Context } from "hono";
import { getAllPredictionsByUser, getPredictionsByUserAndRace } from "../queries/predictionQueries";
import { findUserByUsernameOrEmail } from "../queries/userQueries";
import type { AppEnv } from "../types";

export async function getUserPredictions(c: Context<AppEnv>) {
	const { env } = c;
	// The authenticated requesting user's ID comes from the session cookie via middleware
	const requestingUserId = c.get("userId");

	const username = c.req.query("username");
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

		// Same user viewing their own predictions — return everything as owner
		if (requestingUserId === targetUser.id) {
			return c.json({
				predictions,
				isOwner: true,
			});
		}

		// Different user — only reveal predictions for races where the requester has also locked
		const availablePredictions: typeof predictions = [];
		const unavailableRaces: string[] = [];

		for (const pred of predictions) {
			const requestingPred = await getPredictionsByUserAndRace(
				env.F1_PREDICTIONS,
				requestingUserId,
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
