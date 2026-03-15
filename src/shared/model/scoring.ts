import type { CircuitCode } from "./codes";
import type { DriverTag } from "./driver";

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
	username: string;
	circuitCode: CircuitCode;
	score: number;
	exactMatches: number;
	breakdown: ScoreBreakdown;
	session_key: number;
};

export type ScoreRaceResponse = {
	scored: number;
	results: UserRaceScore[];
};
