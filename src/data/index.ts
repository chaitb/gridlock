import ALL_RACES from "./races.json";
import ALL_SESSIONS from "./sessions.json";
import type { CountryCode } from "@/model";
import type { RaceCode, Race, Session, CircuitCode } from "@/model";

export const RACES_2026: Race[] = ALL_RACES.map((race) => ({
	...race,
	code: race.code as RaceCode,
	date: new Date(race.date),
	country: race.country as CountryCode,
	circuit_code: race.circuit_short_name.toLocaleLowerCase().replace(" ", "-") as CircuitCode,
}));

export const SESSIONS: Session[] = ALL_SESSIONS.map((session) => ({
	...session,
	country_code: session.country_code as CountryCode,
	circuit_code: session.circuit_short_name.toLocaleLowerCase().replace(" ", "-") as CircuitCode,
}));
