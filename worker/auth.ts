import { jwtVerify, SignJWT } from "jose";

const MAGIC_EXPIRY = "15m";
const SESSION_EXPIRY = "30d";

function secretKey(secret: string): Uint8Array {
	return new TextEncoder().encode(secret);
}

/**
 * Signs a short-lived magic-link JWT (15 min) containing the player's numeric ID.
 */
export async function signMagicToken(userId: number, secret: string): Promise<string> {
	return new SignJWT({ purpose: "magic-link" })
		.setProtectedHeader({ alg: "HS256" })
		.setSubject(String(userId))
		.setIssuedAt()
		.setExpirationTime(MAGIC_EXPIRY)
		.sign(secretKey(secret));
}

/**
 * Verifies a magic-link JWT and returns the player ID, or null if invalid/expired.
 */
export async function verifyMagicToken(token: string, secret: string): Promise<number | null> {
	try {
		const { payload } = await jwtVerify(token, secretKey(secret));
		if (payload.purpose !== "magic-link" || !payload.sub) return null;
		const id = Number(payload.sub);
		return Number.isFinite(id) && id > 0 ? id : null;
	} catch {
		return null;
	}
}

/**
 * Signs a 30-day session JWT containing the player's numeric ID.
 */
export async function signSessionToken(userId: number, secret: string): Promise<string> {
	return new SignJWT({})
		.setProtectedHeader({ alg: "HS256" })
		.setSubject(String(userId))
		.setIssuedAt()
		.setExpirationTime(SESSION_EXPIRY)
		.sign(secretKey(secret));
}

/**
 * Verifies a session JWT and returns the player ID, or null if invalid/expired.
 */
export async function verifySessionToken(token: string, secret: string): Promise<number | null> {
	try {
		const { payload } = await jwtVerify(token, secretKey(secret));
		if (!payload.sub) return null;
		const id = Number(payload.sub);
		return Number.isFinite(id) && id > 0 ? id : null;
	} catch {
		return null;
	}
}

/** 30-day MaxAge in seconds, used for the session cookie. */
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
