import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { SESSION_MAX_AGE, signSessionToken, verifyMagicToken } from "../auth";
import { findUserById, setVerifiedAt } from "../queries/userQueries";
import type { AppEnv } from "../types";

/**
 * GET /api/verify?token=<magic-jwt>
 *
 * Validates the 15-minute magic-link JWT, issues a 30-day session cookie,
 * and marks the player as verified on first use.
 */
export async function verifyMagicLink(c: Context<AppEnv>) {
	const { env } = c;

	const token = c.req.query("token");
	if (!token) {
		return c.json({ message: "Missing token" }, 400);
	}

	const userId = await verifyMagicToken(token, env.JWT_SECRET);
	if (!userId) {
		return c.json({ message: "This link is invalid or has expired. Please request a new one." }, 401);
	}

	const user = await findUserById(env.F1_PREDICTIONS, userId);
	if (!user) {
		return c.json({ message: "User not found" }, 404);
	}

	// Stamp verified_at on the very first successful verification
	if (!user.verified_at) {
		await setVerifiedAt(env.F1_PREDICTIONS, userId);
	}

	const sessionToken = await signSessionToken(userId, env.JWT_SECRET);

	// Secure flag: true in production (HTTPS), false for local HTTP dev
	const isSecure = env.APP_URL.startsWith("https");

	setCookie(c, "session", sessionToken, {
		httpOnly: true,
		secure: isSecure,
		sameSite: "Lax",
		path: "/",
		maxAge: SESSION_MAX_AGE,
	});

	return c.json({ message: "Verified", user });
}
