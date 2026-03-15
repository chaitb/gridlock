import { z } from "zod";
import type { CircuitCode, CountryCode } from "./codes";

export type RaceType = {
	round: number;
	code: string;
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
	session_type: "Race" | "Qualifying" | "Practice";
	session_name:
		| "Practice 1"
		| "Practice 2"
		| "Practice 3"
		| "Qualifying"
		| "Race"
		| "Sprint Qualifying"
		| "Sprint";
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

export const sessionResultSchema = z.object({
	position: z.number().nullable(),
	driver_number: z.number(),
	number_of_laps: z.number(),
	points: z.number().optional(),
	dnf: z.boolean(),
	dns: z.boolean(),
	dsq: z.boolean(),
	starting_position: z.number().optional().nullable(),
	gained_lost: z.number().optional().nullable(),
	duration: z.union([z.number(), z.string(), z.array(z.number().nullable())]).nullable(),
	gap_to_leader: z.union([z.number(), z.string(), z.array(z.number().nullable())]).nullable(),
	meeting_key: z.number(),
	session_key: z.number(),
});

export type SessionResult = z.infer<typeof sessionResultSchema>;
