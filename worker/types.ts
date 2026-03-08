import type { D1Database } from "@cloudflare/workers-types";

export type Bindings = {
	F1_PREDICTIONS: D1Database;
	RESEND_API_KEY: string;
	/** HS256 signing secret — set via `wrangler secret put JWT_SECRET` in production */
	JWT_SECRET: string;
	/** Public base URL of the app, e.g. https://gridlock.chaitanyabhagwat.com */
	APP_URL: string;
};

export type Variables = {
	/** Numeric player ID extracted from the verified session JWT */
	userId: number;
};

export type AppEnv = {
	Bindings: Bindings;
	Variables: Variables;
};
