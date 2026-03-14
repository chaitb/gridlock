import type { Context } from "hono";
import { z } from "zod";
import {
	getScoreByUserAndCircuit,
	getScoresByCircuit,
	getSeasonScores,
} from "../queries/scoreQueries";
import { findUserById } from "../queries/userQueries";
import { scoreRace } from "../scoring/index";
import type { AppEnv } from "../types";

const ADMIN_EMAILS = [
	"chaitanya@chaitanyabhagwat.com",
	"chaitwheels@gmail.com",
	"chai.bhagwat@gmail.com",
];

const scoreRaceSchema = z.object({
	circuitCode: z.string().trim().min(2),
});

export async function adminScoreRace(c: Context<AppEnv>) {
	const userId = c.get("userId");
	const user = await findUserById(c.env.F1_PREDICTIONS, userId);

	if (!user || !ADMIN_EMAILS.includes(user.email)) {
		return c.json({ message: "Unauthorized" }, 403);
	}

	const body = await c.req.json().catch(() => null);
	const parsed = scoreRaceSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ message: "Invalid request", errors: parsed.error.issues }, 400);
	}

	const { circuitCode } = parsed.data;

	const result = await scoreRace(c.env.F1_PREDICTIONS, circuitCode);

	const summary = result.results.map((r) => ({
		userId: r.userId,
		score: r.score,
		exactMatches: r.exactMatches,
		breakdown: r.breakdown,
	}));

	return c.json({ scored: result.scored, results: summary });
}

export async function getRaceScores(c: Context<AppEnv>) {
	const circuitCode = c.req.query("circuitCode");
	if (!circuitCode) {
		return c.json({ message: "circuitCode is required" }, 400);
	}

	const scores = await getScoresByCircuit(c.env.F1_PREDICTIONS, circuitCode);

	return c.json(
		scores.map((s) => ({
			userId: s.user_id,
			username: s.username,
			circuitCode: s.circuit_code,
			score: s.score,
			exactMatches: s.exact_matches,
			breakdown: s.breakdown ? JSON.parse(s.breakdown) : null,
		}))
	);
}

export async function getMyRaceScore(c: Context<AppEnv>) {
	const userId = c.get("userId");
	const circuitCode = c.req.query("circuitCode");
	if (!circuitCode) {
		return c.json({ message: "circuitCode is required" }, 400);
	}

	const score = await getScoreByUserAndCircuit(c.env.F1_PREDICTIONS, userId, circuitCode);

	if (!score) {
		return c.json({ message: "No score found" }, 404);
	}

	return c.json({
		userId: score.user_id,
		circuitCode: score.circuit_code,
		score: score.score,
		exactMatches: score.exact_matches,
		breakdown: score.breakdown ? JSON.parse(score.breakdown) : null,
	});
}

export async function getSeasonScoresRoute(c: Context<AppEnv>) {
	const scores = await getSeasonScores(c.env.F1_PREDICTIONS);

	return c.json(
		scores.map((s) => ({
			userId: s.user_id,
			totalScore: s.total_score,
			totalExactMatches: s.total_exact_matches,
			racesScored: s.races_scored,
		}))
	);
}
