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

export type ScoringCategory = "qualifying" | "race" | "gainers" | "losers";

export function getMaxPointsForCategory(category: ScoringCategory): number {
	const config = SCORING_CONFIG[category];
	return Math.max(...config.tiers.map((t) => t.points));
}

export function getScoreOutOf(category: ScoringCategory, _key: string): number {
	return getMaxPointsForCategory(category);
}
