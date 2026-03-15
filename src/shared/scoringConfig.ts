import scoringJson from "@/data/scoring.json";

export type PositionTier = {
	label: string;
	maxOffset: number;
	points: number;
};

export type GainerLoserTier = {
	label: string;
	rule: "exact_rank" | "in_top_3" | "any_gain" | "any_loss";
	points: number;
};

export type ScoringConfig = {
	qualifying: { positions: number; tiers: PositionTier[] };
	race: { positions: number; tiers: PositionTier[] };
	gainers: { picks: number; tiers: GainerLoserTier[] };
	losers: { picks: number; tiers: GainerLoserTier[] };
	bonuses: {
		hot_streak: {
			consecutiveRaces: number;
			requires: string;
			points: number;
		};
	};
	rules: {
		dnf: string;
		tiebreaker: string[];
	};
};

export const SCORING_CONFIG: ScoringConfig = scoringJson as ScoringConfig;

export function getMaxPointsForCategory(
	category: "qualifying" | "race" | "gainers" | "losers"
): number {
	const config = SCORING_CONFIG[category];
	return Math.max(...config.tiers.map((t) => t.points));
}

export function getScoreOutOf(
	category: "qualifying" | "race" | "gainers" | "losers",
	_key: string
): number {
	return getMaxPointsForCategory(category);
}
