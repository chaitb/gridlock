import type { Context } from "hono";
import { getAllPredictionsByUser } from "../queries/predictionQueries";
import { findUserByUsernameOrEmail } from "../queries/userQueries";

export async function getMyPredictions(c: Context) {
	const { env } = c;
	if (!env.F1_PREDICTIONS) {
		return c.json({ message: "D1 binding missing" }, 500);
	}

	const username = c.req.query("userId");
	if (!username) {
		return c.json({ message: "Missing userId" }, 400);
	}

	try {
		const user = await findUserByUsernameOrEmail(env.F1_PREDICTIONS, username);
		if (!user) {
			return c.json({ message: "User not found" }, 404);
		}

		const result = await getAllPredictionsByUser(env.F1_PREDICTIONS, user.id);

		return c.json({ predictions: result.results });
	} catch (error) {
		console.error("[my-predictions] unexpected error", error);
		return c.json({ message: "Database error" }, 500);
	}
}
