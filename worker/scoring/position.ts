import type { DriverTag } from "@/shared/model";
import type { PositionPredictionScore, PositionTier } from "./types";

type ActualResult = {
	position: number;
	dnf: boolean;
};

export function scorePositionCategory(
	predictions: Record<string, DriverTag | null>,
	actualResults: Map<DriverTag, ActualResult>,
	tiers: PositionTier[],
	totalDrivers: number
): { scores: Record<string, PositionPredictionScore>; total: number; exactMatches: number } {
	const scores: Record<string, PositionPredictionScore> = {};
	let total = 0;
	let exactMatches = 0;

	const sortedTiers = [...tiers].sort((a, b) => a.maxOffset - b.maxOffset);

	for (const [key, driver] of Object.entries(predictions)) {
		const predictedPosition = positionKeyToNumber(key);

		if (!driver) {
			scores[key] = {
				driver: "" as DriverTag,
				predicted: predictedPosition,
				actual: null,
				accuracy: "empty",
				points: 0,
			};
			continue;
		}

		const result = actualResults.get(driver);
		const actualPosition =
			result === undefined ? null : result.dnf ? totalDrivers : result.position;

		const { accuracy, points } = computePositionAccuracy(
			predictedPosition,
			actualPosition,
			sortedTiers
		);

		if (accuracy === "bullseye") exactMatches++;
		total += points;

		scores[key] = {
			driver,
			predicted: predictedPosition,
			actual: actualPosition,
			accuracy,
			points,
		};
	}

	return { scores, total, exactMatches };
}

function computePositionAccuracy(
	predicted: number,
	actual: number | null,
	tiers: PositionTier[]
): { accuracy: string; points: number } {
	if (actual === null) {
		return { accuracy: "no_result", points: 0 };
	}

	const offset = Math.abs(predicted - actual);

	for (const tier of tiers) {
		if (offset <= tier.maxOffset) {
			return { accuracy: tier.label, points: tier.points };
		}
	}

	return { accuracy: "miss", points: 0 };
}

function positionKeyToNumber(key: string): number {
	const num = Number.parseInt(key.replace(/\D/g, ""), 10);
	return num;
}
