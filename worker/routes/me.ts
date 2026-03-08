import type { Context } from "hono";
import { findUserById } from "../queries/userQueries";
import type { AppEnv } from "../types";

/**
 * GET /api/me  (protected by requireAuth middleware)
 *
 * Returns the currently authenticated player's profile.
 * The frontend calls this on mount to hydrate the UserContext from the session cookie.
 */
export async function getMe(c: Context<AppEnv>) {
	const userId = c.get("userId");

	const user = await findUserById(c.env.F1_PREDICTIONS, userId);
	if (!user) {
		return c.json({ message: "User not found" }, 404);
	}

	return c.json({ user });
}
