import { z } from "zod";
import type { Constructor } from "@/App/driver";

export const driverTagSchema = z.enum([
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

export const nullableDriverTagSchema = driverTagSchema.nullable();

export type Driver = {
	full_name: string;
	number: number;
	acronym: DriverTag;
	team_name: Constructor;
	colour: string;
	headshot_url: string;
};
