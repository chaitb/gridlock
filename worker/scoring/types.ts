import type { DriverTag } from "@/shared/model";

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

export type PositionPredictionScore = {
	driver: DriverTag;
	predicted: number;
	actual: number | null;
	accuracy: string;
	points: number;
};

export type GainerLoserPredictionScore = {
	driver: DriverTag;
	predictedRank: number;
	actualRank: number | null;
	gainedLost: number;
	accuracy: string;
	points: number;
};

export type BonusScore = {
	type: string;
	points: number;
};

export type ScoreBreakdown = {
	qualifying: Record<string, PositionPredictionScore>;
	race: Record<string, PositionPredictionScore>;
	gainers: Record<string, GainerLoserPredictionScore>;
	losers: Record<string, GainerLoserPredictionScore>;
	bonuses: BonusScore[];
};

export type UserRaceScore = {
	userId: number;
	circuitCode: string;
	score: number;
	exactMatches: number;
	breakdown: ScoreBreakdown;
};
