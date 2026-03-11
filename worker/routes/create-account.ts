import type { Context } from "hono";
import { createAccountSchema } from "@/shared/model";
import { signMagicToken } from "../auth";
import { sendMagicLinkEmail } from "../email";
import { createUser, findUserByUsernameOrEmail } from "../queries/userQueries";
import type { AppEnv } from "../types";

export async function createAccount(c: Context<AppEnv>) {
	const { env, req } = c;
	if (!env.F1_PREDICTIONS) {
		return c.json({ message: "D1 binding missing" }, 500);
	}

	const body = await req.json().catch(() => null);
	const parsed = createAccountSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ message: "Invalid request", errors: parsed.error.issues }, 400);
	}

	const { username, email } = parsed.data;
	try {
		const conflict = await findUserByUsernameOrEmail(env.F1_PREDICTIONS, username, email);

		if (conflict) {
			const conflictData = conflict as {
				username: string | null;
				email: string | null;
			};
			if (conflictData.email === email && conflictData.username === username) {
				return c.json({ message: "Account already exists" }, 409);
			}
			if (conflictData.email === email) {
				return c.json({ message: "Email already in use" }, 409);
			}
			return c.json({ message: "Username already in use" }, 409);
		}

		const result = await createUser(env.F1_PREDICTIONS, username, email);

		if (!result.success) {
			console.error("[create-account] INSERT failed", result);
			return c.json({ message: "Database error" }, 500);
		}

		const newUserId = result.meta.last_row_id as number;
		const magicToken = await signMagicToken(newUserId, env.JWT_SECRET);
		const magicLink = `${env.APP_URL}/verify?token=${magicToken}`;

		const emailResult = await sendMagicLinkEmail(env.RESEND_API_KEY, email, magicLink);
		if (!emailResult.success) {
			console.error("[create-account] email send failed", emailResult.error);
			// Account was created but email failed — still return success but warn
			return c.json(
				{
					message: "Account created but failed to send login email. Contact support.",
				},
				500
			);
		}

		return c.json({ message: "Account created. Check your email to log in." }, 201);
	} catch (error) {
		console.error("[create-account] unexpected error", error);
		return c.json({ message: "Database error" }, 500);
	}
}
