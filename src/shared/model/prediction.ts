import { z } from "zod";
import { nullableDriverTagSchema } from "./driver";

const driverPositionSchema = z.object({
	p1: nullableDriverTagSchema,
	p2: nullableDriverTagSchema,
	p3: nullableDriverTagSchema,
	p4: nullableDriverTagSchema,
	p5: nullableDriverTagSchema,
});

const gainerLoserSchema = z.object({
	g1: nullableDriverTagSchema,
	g2: nullableDriverTagSchema,
	g3: nullableDriverTagSchema,
});

const loserSchema = z.object({
	l1: nullableDriverTagSchema,
	l2: nullableDriverTagSchema,
	l3: nullableDriverTagSchema,
});

export const predictionContentSchema = z.object({
	qualifying: driverPositionSchema,
	race: driverPositionSchema,
	gainers: gainerLoserSchema,
	losers: loserSchema,
});

export const storedPredictionSchema = predictionContentSchema.extend({
	isComplete: z.boolean(),
});

export const savePredictionsSchema = z.object({
	circuitCode: z.string().trim().min(2),
	predictions: predictionContentSchema,
	isComplete: z.boolean().optional().default(false),
});

export const lockPredictionSchema = z.object({
	circuitCode: z.string().trim().min(2),
});

export const predictionSchema = z.object({
	id: z.number(),
	user_id: z.number(),
	circuit_code: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	prediction: z.string().nullable(),
	locked: z.number().default(0),
});

export type PredictionContent = z.infer<typeof predictionContentSchema>;
export type StoredPrediction = z.infer<typeof storedPredictionSchema>;
export type Prediction = z.infer<typeof predictionSchema>;

export const initialPredictions: PredictionContent = {
	qualifying: { p1: null, p2: null, p3: null, p4: null, p5: null },
	race: { p1: null, p2: null, p3: null, p4: null, p5: null },
	gainers: { g1: null, g2: null, g3: null },
	losers: { l1: null, l2: null, l3: null },
};

export const QUALIFYING_KEYS = ["p1", "p2", "p3", "p4", "p5"] as const;
export const GAINER_KEYS = ["g1", "g2", "g3"] as const;
export const LOSER_KEYS = ["l1", "l2", "l3"] as const;
