import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import type { AppEnv } from "../types";

/**
 * POST /api/logout
 *
 * Clears the session cookie by setting it to an empty value with MaxAge 0.
 */
export async function logout(c: Context<AppEnv>) {
	const isSecure = c.env.APP_URL.startsWith("https");

	setCookie(c, "session", "", {
		httpOnly: true,
		secure: isSecure,
		sameSite: "Lax",
		path: "/",
		maxAge: 0,
	});

	return c.json({ message: "Logged out" });
}
