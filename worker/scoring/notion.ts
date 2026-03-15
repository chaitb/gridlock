import { Client, isFullPage, type PageObjectResponse } from "@notionhq/client";
import { DRIVERS } from "@/App/driver";
import type { Session } from "@/shared/model";

const SESSION_DRIVER_RESULTS_DB = "31f5efd6-33b8-8045-83ae-000be242952d";

export type NotionSessionResult = {
	session_key: number;
	meeting_key: number;
	driver_number: number;
	position: number | null;
	dnf: boolean;
	dns: boolean;
	dsq: boolean;
	starting_position: number | null;
	gained_lost: number | null;
};

export async function fetchNotionSessionResults(
	notionApiKey: string,
	session: Session
): Promise<NotionSessionResult[]> {
	const notion = new Client({ auth: notionApiKey });
	const pages: Array<Awaited<ReturnType<typeof notion.dataSources.query>>["results"][number]> = [];
	let cursor: string | undefined;

	do {
		const response = await notion.dataSources.query({
			data_source_id: SESSION_DRIVER_RESULTS_DB,
			filter: {
				property: "Session Key",
				rollup: { any: { number: { equals: session.session_key } } },
			},
			start_cursor: cursor,
		});

		pages.push(...response.results);
		cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
	} while (cursor);

	return pages
		.filter(isFullPage)
		.map((page) => toNotionSessionResult(page.properties, session))
		.filter((result): result is NotionSessionResult => result !== null);
}

function toNotionSessionResult(
	properties: PageObjectResponse["properties"],
	session: Session
): NotionSessionResult | null {
	const driverTag = getStringProperty(properties, ["Driver Tag"]);
	if (!driverTag) return null;

	const driver = DRIVERS.find((candidate) => candidate.acronym === driverTag);
	if (!driver) return null;

	const finishPosition = getNumberProperty(properties, ["Finish Position", "Position"]);
	const status = getStringProperty(properties, ["Status"]);
	const startingPosition = getNumberProperty(properties, [
		"Starting Position",
		"Start Position",
		"Grid Position",
		"Starting Grid",
		"Grid",
	]);
	const gainedLost = getNumberProperty(properties, ["Gained/Lost"]);
	const normalizedStatus = (status ?? "").toUpperCase();

	return {
		session_key: session.session_key,
		meeting_key: session.meeting_key,
		driver_number: driver.number,
		position: finishPosition,
		dnf: normalizedStatus === "DNF",
		dns: normalizedStatus === "DNS",
		dsq: normalizedStatus === "DSQ",
		starting_position: startingPosition,
		gained_lost: gainedLost,
	};
}

function getProperty(properties: PageObjectResponse["properties"], names: string[]) {
	for (const name of names) {
		if (name in properties) {
			return properties[name];
		}
	}

	return undefined;
}

function getStringProperty(
	properties: PageObjectResponse["properties"],
	names: string[]
): string | null {
	const property = getProperty(properties, names);
	if (!property || typeof property !== "object") return null;

	if (property.type === "select") {
		return property.select?.name ?? null;
	}

	if (property.type === "rich_text") {
		return property.rich_text?.[0]?.plain_text ?? null;
	}

	if (property.type === "formula") {
		if (property.formula?.type === "string") return property.formula.string ?? null;
	}

	if (property.type === "rollup") {
		if (property.rollup?.type === "array") {
			const first = property.rollup.array?.[0];
			if (first?.type === "rich_text") {
				return first.rich_text?.[0]?.plain_text ?? null;
			}
			if (first?.type === "select") {
				return first.select?.name ?? null;
			}
		}
		if (property.rollup?.type === "number") {
			return property.rollup.number?.toString() ?? null;
		}
	}

	return null;
}

function getNumberProperty(
	properties: PageObjectResponse["properties"],
	names: string[]
): number | null {
	const property = getProperty(properties, names);
	if (!property || typeof property !== "object") return null;

	if (property.type === "number") {
		return property.number ?? null;
	}

	if (property.type === "formula" && property.formula?.type === "number") {
		return property.formula.number ?? null;
	}

	if (property.type === "rollup") {
		if (property.rollup?.type === "number") {
			return property.rollup.number ?? null;
		}
		if (property.rollup?.type === "array") {
			const first = property.rollup.array?.[0];
			if (first?.type === "number") {
				return first.number ?? null;
			}
		}
	}

	return null;
}
