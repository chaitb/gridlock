import type { Context } from "hono";
import { z } from "zod";
import { type SessionResult, sessionResultSchema } from "@/shared/model";
import { err, ok, type Result, tryAsync } from "@/shared/Result";
import {
	getSessionResultsBySessionKey,
	hasSessionResults,
	insertSessionResults,
} from "../queries/sessionResultQueries";
import type { AppEnv } from "../types";

const OPENF1_BASE_URL = "https://api.openf1.org/v1";

const paramsSchema = z.object({
	session_key: z.coerce.number().int().positive(),
});

async function fetchFromOpenF1(sessionKey: number): Promise<Result<SessionResult[], Error>> {
	const url = `${OPENF1_BASE_URL}/session_result?session_key=${sessionKey}`;
	const response = await fetch(url);

	if (!response.ok) {
		return err(new Error(`OpenF1 API error: ${response.status} ${response.statusText}`));
	}

	const data = await response.json();
	console.log("OpenF1 response:", data);

	const parsed = z.array(sessionResultSchema).safeParse(data);

	if (!parsed.success) {
		console.error("[session-results] parse error:", parsed.error.issues);
		return err(new Error("Invalid response from OpenF1 API"));
	}

	return ok(parsed.data);
}

export async function getSessionResults(c: Context<AppEnv>) {
	const { env } = c;

	const sessionKey = c.req.query("session_key");
	const parsed = paramsSchema.safeParse({ session_key: sessionKey });

	if (!parsed.success) {
		return c.json({ message: "Invalid request", errors: parsed.error.issues }, 400);
	}

	const { session_key } = parsed.data;

	const cachedResult = await tryAsync(() => hasSessionResults(env.F1_PREDICTIONS, session_key));
	if (!cachedResult.ok) {
		console.error("[session-results] cache check error", cachedResult.error);
		return c.json({ message: "Failed to fetch session results" }, 500);
	}

	if (cachedResult.value) {
		const resultsResult = await tryAsync(() =>
			getSessionResultsBySessionKey(env.F1_PREDICTIONS, session_key)
		);
		if (!resultsResult.ok) {
			console.error("[session-results] fetch cached error", resultsResult.error);
			return c.json({ message: "Failed to fetch session results" }, 500);
		}
		return c.json(resultsResult.value);
	}

	console.log(`[session-results] fetching from OpenF1 for session_key=${session_key}`);
	const openF1Result = await fetchFromOpenF1(session_key);

	if (!openF1Result.ok) {
		console.error("[session-results] openf1 error", openF1Result.error);
		return c.json({ message: "Failed to fetch session results" }, 500);
	}

	const insertResult = await tryAsync(() =>
		insertSessionResults(env.F1_PREDICTIONS, openF1Result.value)
	);
	if (!insertResult.ok) {
		console.error("[session-results] insert error", insertResult.error);
		return c.json({ message: "Failed to fetch session results" }, 500);
	}

	return c.json(openF1Result.value);
}
