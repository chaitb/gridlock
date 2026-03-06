import type { Context } from "hono";
import { getLeaderboard } from "../queries/userQueries";

export async function leaderboard(c: Context) {
	const { env } = c;
	if (!env.F1_PREDICTIONS) {
		return c.json({ message: "D1 binding missing" }, 500);
	}

	try {
		const result = await getLeaderboard(env.F1_PREDICTIONS);
		return c.json({ players: result.results });
	} catch (error) {
		console.error("[leaderboard] unexpected error", error);
		return c.json({ message: "Database error" }, 500);
	}
}
