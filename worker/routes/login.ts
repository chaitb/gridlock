import type { Context } from "hono";
import { loginSchema } from "../../src/model";
import { findUserByEmail } from "../queries/userQueries";

export async function login(c: Context) {
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

		return c.json({
			message: "Success",
			user: result.results[0],
		});
	} catch (error) {
		console.error("[login] unexpected error", error);
		return c.json({ message: "Database error" }, 500);
	}
}
