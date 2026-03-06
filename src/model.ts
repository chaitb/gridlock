import { z } from "zod";

const driverTagSchema = z.enum([
	"NOR",
	"VER",
	"BOR",
	"HAD",
	"GAS",
	"PER",
	"ANT",
	"ALO",
	"LEC",
	"STR",
	"ALB",
	"HUL",
	"LAW",
	"OCO",
	"LIN",
	"COL",
	"HAM",
	"SAI",
	"RUS",
	"BOT",
	"PIA",
	"BEA",
]);

export type DriverTag = z.infer<typeof driverTagSchema>;

const nullableDriverTagSchema = driverTagSchema.nullable();

export const emailSchema = z.string().email().trim();

export const loginSchema = z.object({
	email: emailSchema,
});

export const createAccountSchema = z.object({
	username: z.string().trim().min(1),
	email: emailSchema,
});

export const updateProfileSchema = z.object({
	id: z.number().int().positive(),
	username: z.string().trim().min(1),
});

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
	userId: z.number().int().positive(),
	raceCode: z.string().trim().min(2),
	predictions: predictionContentSchema,
	isComplete: z.boolean().optional().default(false),
});

export const getPredictionsSchema = z.object({
	userId: z.string().trim().min(3),
	raceCode: z.string().trim().min(2),
});

export const userSchema = z.object({
	id: z.number(),
	username: z.string().nullable(),
	email: z.string(),
	created_at: z.string(),
	verified_at: z.string().nullable(),
	updated_at: z.string(),
	deleted_at: z.string().nullable(),
	preferences: z.string().nullable(),
});

export const leaderboardEntrySchema = z.object({
	rank: z.number(),
	username: z.string(),
	points: z.number(),
});

export const predictionSchema = z.object({
	id: z.number(),
	user_id: z.number(),
	race_code: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	prediction: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type Prediction = z.infer<typeof predictionSchema>;
export type PredictionContent = z.infer<typeof predictionContentSchema>;
export type StoredPrediction = z.infer<typeof storedPredictionSchema>;

export const initialPredictions: PredictionContent = {
	qualifying: {
		p1: null,
		p2: null,
		p3: null,
		p4: null,
		p5: null,
	},
	race: {
		p1: null,
		p2: null,
		p3: null,
		p4: null,
		p5: null,
	},
	gainers: {
		g1: null,
		g2: null,
		g3: null,
	},
	losers: {
		l1: null,
		l2: null,
		l3: null,
	},
};
