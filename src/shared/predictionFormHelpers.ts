import { DRIVERS } from "@/App/driver";

function shuffle<T>(arr: T[]): T[] {
	const copy = [...arr];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

export function randomizeSection<T extends Record<string, string | null>>(section: T): T {
	const selectedAcronyms = new Set(Object.values(section).filter(Boolean) as string[]);
	const remaining = shuffle(DRIVERS.filter((dr) => !selectedAcronyms.has(dr.acronym)));

	let idx = 0;
	const entries = Object.keys(section).map((key) => {
		if (section[key]) return [key, section[key]] as const;
		const next = remaining[idx++];
		return [key, next?.acronym ?? null] as const;
	});

	return Object.fromEntries(entries) as T;
}
