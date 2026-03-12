import type { CircuitCode, CountryCode, RaceCode, Session } from "@/shared/model";
import { Race } from "@/shared/Race";
import ALL_RACES from "./races.json";
import ALL_SESSIONS from "./sessions.json";

export const SESSIONS: Session[] = ALL_SESSIONS.map((session) => ({
	...session,
	country_code: session.country_code as CountryCode,
	circuit_code: session.circuit_short_name.toLocaleLowerCase().replace(" ", "-") as CircuitCode,
}));

export const RACES_2026: Race[] = ALL_RACES.map((race) => {
	return new Race(
		{
			round: race.round,
			code: race.code as RaceCode,
			date: new Date(race.date),
			country: race.country as CountryCode,
			name: race.name,
			venue: race.venue,
			sprint: race.sprint,
			circuit_key: race.circuit_key,
			circuit_short_name: race.circuit_short_name,
			circuit_code: race.circuit_short_name.toLocaleLowerCase().replace(" ", "-") as CircuitCode,
		},
		SESSIONS
	);
});
