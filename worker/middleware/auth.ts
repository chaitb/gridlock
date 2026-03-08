import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { verifySessionToken } from "../auth";
import type { AppEnv } from "../types";

/**
 * Hono middleware that validates the `session` HTTP-only cookie.
 * On success, sets `c.var.userId` (numeric player ID) for downstream handlers.
 * Returns 401 if the cookie is missing or the JWT is invalid/expired.
 */
export async function requireAuth(c: Context<AppEnv>, next: Next) {
	const token = getCookie(c, "session");
	if (!token) {
		return c.json({ message: "Unauthorized" }, 401);
	}

	const userId = await verifySessionToken(token, c.env.JWT_SECRET);
	if (!userId) {
		return c.json({ message: "Unauthorized" }, 401);
	}

	c.set("userId", userId);
	await next();
}
