import type { DriverTag } from "@/shared/model";
import type { GainerLoserPredictionScore, GainerLoserTier } from "./types";

type DriverGainLoss = {
	driver: DriverTag;
	gainedLost: number;
};

export function scoreGainersCategory(
	predictions: Record<string, DriverTag | null>,
	ranking: DriverGainLoss[],
	allDriverGains: Map<DriverTag, number>,
	tiers: GainerLoserTier[]
): { scores: Record<string, GainerLoserPredictionScore>; total: number; exactMatches: number } {
	return scoreGainerLoserCategory(predictions, ranking, allDriverGains, tiers, "gainer");
}

export function scoreLosersCategory(
	predictions: Record<string, DriverTag | null>,
	ranking: DriverGainLoss[],
	allDriverGains: Map<DriverTag, number>,
	tiers: GainerLoserTier[]
): { scores: Record<string, GainerLoserPredictionScore>; total: number; exactMatches: number } {
	return scoreGainerLoserCategory(predictions, ranking, allDriverGains, tiers, "loser");
}

function scoreGainerLoserCategory(
	predictions: Record<string, DriverTag | null>,
	ranking: DriverGainLoss[],
	allDriverGains: Map<DriverTag, number>,
	tiers: GainerLoserTier[],
	direction: "gainer" | "loser"
): { scores: Record<string, GainerLoserPredictionScore>; total: number; exactMatches: number } {
	const scores: Record<string, GainerLoserPredictionScore> = {};
	let total = 0;
	let exactMatches = 0;

	const top3 = ranking.slice(0, 3);

	for (const [key, driver] of Object.entries(predictions)) {
		const predictedRank = rankKeyToNumber(key);

		if (!driver) {
			scores[key] = {
				driver: "" as DriverTag,
				predictedRank,
				actualRank: null,
				gainedLost: 0,
				accuracy: "empty",
				points: 0,
			};
			continue;
		}

		const gainedLost = allDriverGains.get(driver) ?? 0;
		const actualRankIndex = ranking.findIndex((r) => r.driver === driver);
		const actualRank = actualRankIndex === -1 ? null : actualRankIndex + 1;

		const { accuracy, points } = computeGainerLoserAccuracy(
			driver,
			predictedRank,
			actualRank,
			gainedLost,
			top3,
			tiers,
			direction
		);

		if (accuracy === "perfect_match") exactMatches++;
		total += points;

		scores[key] = {
			driver,
			predictedRank,
			actualRank,
			gainedLost,
			accuracy,
			points,
		};
	}

	return { scores, total, exactMatches };
}

function computeGainerLoserAccuracy(
	driver: DriverTag,
	predictedRank: number,
	actualRank: number | null,
	gainedLost: number,
	top3: DriverGainLoss[],
	tiers: GainerLoserTier[],
	direction: "gainer" | "loser"
): { accuracy: string; points: number } {
	const isInTop3 = top3.some((r) => r.driver === driver);

	for (const tier of tiers) {
		if (tier.rule === "exact_rank") {
			if (actualRank === predictedRank && isInTop3) {
				return { accuracy: tier.label, points: tier.points };
			}
		}

		if (tier.rule === "in_top_3") {
			if (isInTop3) {
				return { accuracy: tier.label, points: tier.points };
			}
		}

		if (tier.rule === "any_gain" && direction === "gainer") {
			if (gainedLost > 0) {
				return { accuracy: tier.label, points: tier.points };
			}
		}

		if (tier.rule === "any_loss" && direction === "loser") {
			if (gainedLost < 0) {
				return { accuracy: tier.label, points: tier.points };
			}
		}
	}

	return { accuracy: "no_change", points: 0 };
}

function rankKeyToNumber(key: string): number {
	return Number.parseInt(key.replace(/\D/g, ""), 10);
}
