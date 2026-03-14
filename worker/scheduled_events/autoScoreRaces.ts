import { SESSIONS } from "@/data/index";
import { hasScoresForCircuit } from "../queries/scoreQueries";
import { hasSessionResults } from "../queries/sessionResultQueries";
import { scoreRace } from "../scoring/index";
import type { Bindings } from "../types";

export async function autoScoreRaces(env: Bindings): Promise<void> {
	const now = new Date();
	const db = env.F1_PREDICTIONS;

	const raceSessions = SESSIONS.filter(
		(s) => s.session_type === "Race" && !s.session_name.toLowerCase().includes("sprint")
	);

	for (const session of raceSessions) {
		const raceEnd = new Date(session.date_end);
		if (raceEnd >= now) continue;

		const circuitCode = session.circuit_code;

		const alreadyScored = await hasScoresForCircuit(db, circuitCode);
		if (alreadyScored) continue;

		const hasResults = await hasSessionResults(db, session.session_key);
		if (!hasResults) continue;

		const qualifyingSession = SESSIONS.find(
			(s) =>
				s.circuit_code === circuitCode &&
				s.session_type === "Qualifying" &&
				!s.session_name.toLowerCase().includes("sprint")
		);

		if (!qualifyingSession) continue;

		const hasQualifyingResults = await hasSessionResults(db, qualifyingSession.session_key);
		if (!hasQualifyingResults) continue;

		console.log(`[autoScoreRaces] scoring race for circuit: ${circuitCode}`);

		const result = await scoreRace(db, circuitCode);

		console.log(`[autoScoreRaces] scored ${result.scored} predictions for ${circuitCode}`);
	}
}
