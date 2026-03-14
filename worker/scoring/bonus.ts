import type { D1Database } from "@cloudflare/workers-types";
import { SCORING_CONFIG } from "./config";
import type { BonusScore } from "./types";

export async function computeBonuses(
	db: D1Database,
	userId: number,
	circuitCode: string,
	currentRaceHasExact: boolean
): Promise<BonusScore[]> {
	const bonuses: BonusScore[] = [];

	const hotStreakBonus = await checkHotStreak(db, userId, circuitCode, currentRaceHasExact);

	if (hotStreakBonus) {
		bonuses.push(hotStreakBonus);
	}

	return bonuses;
}

async function checkHotStreak(
	db: D1Database,
	userId: number,
	circuitCode: string,
	currentRaceHasExact: boolean
): Promise<BonusScore | null> {
	const { consecutiveRaces, points } = SCORING_CONFIG.bonuses.hot_streak;

	if (!currentRaceHasExact) return null;

	const previousScores = await db
		.prepare(
			`SELECT circuit_code, exact_matches
			 FROM predictions
			 WHERE user_id = ?
			   AND circuit_code != ?
			   AND score IS NOT NULL
			   AND locked = 1
			 ORDER BY updated_at DESC
			 LIMIT ?`
		)
		.bind(userId, circuitCode, consecutiveRaces - 1)
		.all<{ circuit_code: string; exact_matches: number }>();

	if (previousScores.results.length < consecutiveRaces - 1) return null;

	const allHaveExact = previousScores.results.every((s) => s.exact_matches > 0);

	if (allHaveExact) {
		return { type: "hot_streak", points };
	}

	return null;
}
