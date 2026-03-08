import type { Context } from "hono";
import { z } from "zod";
import { findUsernameConflict, updateUserUsername } from "../queries/userQueries";
import type { AppEnv } from "../types";

const updateProfileBodySchema = z.object({
	username: z.string().trim().min(1),
});

export async function updateProfile(c: Context<AppEnv>) {
	const { env, req } = c;
	// User ID comes from the verified session cookie — never trust the client to supply their own ID
	const userId = c.get("userId");

	const body = await req.json().catch(() => null);
	const parsed = updateProfileBodySchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ message: "Invalid request", errors: parsed.error.issues }, 400);
	}

	const { username } = parsed.data;
	try {
		const conflict = await findUsernameConflict(env.F1_PREDICTIONS, username, userId);

		if (conflict) {
			return c.json({ message: "Username already in use" }, 409);
		}

		const result = await updateUserUsername(env.F1_PREDICTIONS, username, userId);

		if (!result.success || !result.meta.changes) {
			return c.json({ message: "User not found" }, 404);
		}

		return c.json({ message: "Username updated" });
	} catch (error) {
		console.error("[profile] unexpected error", error);
		return c.json({ message: "Database error" }, 500);
	}
}
