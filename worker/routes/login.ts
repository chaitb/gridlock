import type { Context } from "hono";
import { loginSchema } from "@/shared/model";
import { signMagicToken } from "../auth";
import { sendMagicLinkEmail } from "../email";
import { findUserByEmail } from "../queries/userQueries";
import type { AppEnv } from "../types";

export async function login(c: Context<AppEnv>) {
	const { env, req } = c;
	if (!env.F1_PREDICTIONS) {
		return c.json({ message: "D1 binding missing" }, 500);
	}

	const body = await req.json().catch(() => null);
	const parsed = loginSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ message: "Invalid request", errors: parsed.error.issues }, 400);
	}

	const { email } = parsed.data;
	try {
		const result = await findUserByEmail(env.F1_PREDICTIONS, email);

		if (!result.success) {
			console.error("[login] SELECT failed", result);
			return c.json({ message: "Database error" }, 500);
		}

		const user = result.results[0];
		if (!user) {
			return c.json({ message: "No account found for that email. Create an account first." }, 404);
		}

		const magicToken = await signMagicToken(user.id as number, env.JWT_SECRET);
		const magicLink = `${env.APP_URL}/verify?token=${magicToken}`;

		try {
			await sendMagicLinkEmail(env.RESEND_API_KEY, email, magicLink);
		} catch (error) {
			console.error("[login] email send failed", error);
			return c.json({ message: "Failed to send login email. Please try again." }, 500);
		}

		return c.json({ message: "Check your email for a login link." });
	} catch (error) {
		console.error("[login] unexpected error", error);
		return c.json({ message: "Database error" }, 500);
	}
}
