import { z } from "zod";
import type { Constructor } from "@/App/driver";

export type CountryCode =
	| "aus"
	| "aut"
	| "aze"
	| "bel"
	| "bra"
	| "brn"
	| "can"
	| "chn"
	| "esp"
	| "gbr"
	| "hun"
	| "ita"
	| "jpn"
	| "ksa"
	| "mex"
	| "mon"
	| "ned"
	| "qat"
	| "sgp"
	| "uae"
	| "usa";

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
	circuitCode: z.string().trim().min(2),
	predictions: predictionContentSchema,
	isComplete: z.boolean().optional().default(false),
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

export type User = z.infer<typeof userSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type Prediction = z.infer<typeof predictionSchema>;
export type PredictionContent = z.infer<typeof predictionContentSchema>;
export type StoredPrediction = z.infer<typeof storedPredictionSchema>;

export type Driver = {
	full_name: string;
	number: number;
	acronym: DriverTag;
	team_name: Constructor;
	colour: string;
	headshot_url: string;
};

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

export type RaceCode =
	| "aus"
	| "china"
	| "jpn"
	| "bahrain"
	| "saudi"
	| "miami"
	| "canada"
	| "monaco"
	| "barcelona"
	| "austria"
	| "british"
	| "belgian"
	| "hungarian"
	| "dutch"
	| "italian"
	| "spanish"
	| "azerbaijan"
	| "singapore"
	| "us"
	| "mexico"
	| "brazil"
	| "vegas"
	| "qatar"
	| "abu-dhabi";

export type CircuitCode =
	| "melbourne"
	| "shanghai"
	| "suzuka"
	| "sakhir"
	| "jeddah"
	| "miami"
	| "montreal"
	| "monte-carlo"
	| "catalunya"
	| "spielberg"
	| "silverstone"
	| "spa-francorchamps"
	| "hungaroring"
	| "zandvoort"
	| "monza"
	| "madring"
	| "baku"
	| "singapore"
	| "austin"
	| "mexico-city"
	| "interlagos"
	| "las-vegas"
	| "lusail"
	| "yas-marina-circuit";

export type RaceType = {
	round: number;
	code: RaceCode;
	country: CountryCode;
	name: string;
	venue: string;
	date: Date;
	sprint: boolean;
	circuit_key: number;
	circuit_short_name: string;
	circuit_code: CircuitCode;
};

export type Session = {
	session_key: number;
	session_type: string;
	session_name: string;
	date_start: string;
	date_end: string;
	meeting_key: number;
	circuit_key: number;
	circuit_code: CircuitCode;
	country_key: number;
	country_code: CountryCode;
	country_name: string;
	location: string;
	gmt_offset: string;
	year: number;
};

export { Race } from "./Race";

export const QUALIFYING_KEYS = ["p1", "p2", "p3", "p4", "p5"] as const;
export const GAINER_KEYS = ["g1", "g2", "g3"] as const;
export const LOSER_KEYS = ["l1", "l2", "l3"] as const;

export type SessionResult = {
	position: number | null;
	driver_number: number;
	number_of_laps: number;
	points: number;
	dnf: boolean;
	dns: boolean;
	dsq: boolean;
	duration: number | null;
	gap_to_leader: number | null | string;
	meeting_key: number;
	session_key: number;
};
