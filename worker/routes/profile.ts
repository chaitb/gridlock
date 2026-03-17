import type { Context } from "hono";
import { z } from "zod";
import { findEmailConflict, findUsernameConflict, updateUserProfile } from "../queries/userQueries";
import type { AppEnv } from "../types";

const updateProfileBodySchema = z.object({
	username: z.string().trim().min(1),
	email: z.string().email().trim().optional(),
	full_name: z.string().trim().max(100).nullable().optional(),
	flair: z.string().trim().max(20).nullable().optional(),
});

export async function updateProfile(c: Context<AppEnv>) {
	const { env, req } = c;
	const userId = c.get("userId");

	const body = await req.json().catch(() => null);
	const parsed = updateProfileBodySchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ message: "Invalid request", errors: parsed.error.issues }, 400);
	}

	const { username, email, full_name, flair } = parsed.data;

	try {
		const usernameConflict = await findUsernameConflict(env.F1_PREDICTIONS, username, userId);
		if (usernameConflict) {
			return c.json({ message: "Username already in use" }, 409);
		}

		if (email) {
			const emailConflict = await findEmailConflict(env.F1_PREDICTIONS, email, userId);
			if (emailConflict) {
				return c.json({ message: "Email already in use" }, 409);
			}
		}

		const result = await updateUserProfile(env.F1_PREDICTIONS, userId, {
			username,
			email,
			full_name,
			flair,
		});

		if (!result.success || !result.meta.changes) {
			return c.json({ message: "User not found" }, 404);
		}

		return c.json({ message: "Profile updated" });
	} catch (error) {
		console.error("[profile] unexpected error", error);
		return c.json({ message: "Database error" }, 500);
	}
}
