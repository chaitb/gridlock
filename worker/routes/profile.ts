import type { Context } from "hono";
import { updateProfileSchema } from "../../src/model";
import { findUsernameConflict, updateUserUsername } from "../queries/userQueries";

export async function updateProfile(c: Context) {
	const { env, req } = c;
	if (!env.F1_PREDICTIONS) {
		return c.json({ message: "D1 binding missing" }, 500);
	}

	const body = await req.json().catch(() => null);
	const parsed = updateProfileSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ message: "Invalid request", errors: parsed.error.issues }, 400);
	}

	const { id, username } = parsed.data;
	try {
		const conflict = await findUsernameConflict(env.F1_PREDICTIONS, username, id);

		if (conflict) {
			return c.json({ message: "Username already in use" }, 409);
		}

		const result = await updateUserUsername(env.F1_PREDICTIONS, username, id);

		if (!result.success || !result.meta.changes) {
			return c.json({ message: "User not found" }, 404);
		}

		return c.json({ message: "Username updated" });
	} catch (error) {
		console.error("[profile] unexpected error", error);
		return c.json({ message: "Database error" }, 500);
	}
}
