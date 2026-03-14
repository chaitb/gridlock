import { Client, isFullPage } from "@notionhq/client";

const notion_key = "redacted";
const SESSION_DRIVER_RESULTS_DB = "31f5efd6-33b8-8045-83ae-000be242952d";
// const SESSIONS_DB = "31f5efd6-33b8-80b6-9279-000bea1c498f";

const session_key = 11240;

const notion = new Client({ auth: notion_key });

// const sessions_source = await notion.dataSources.query({
// 	data_source_id: SESSIONS_DB,
// 	filter: {
// 		property: "session_key",
// 		number: { equals: session_key },
// 	},
// });

// if (isFullPage(sessions_source.results[0])) {
// 	console.log(sessions_source.results[0].properties);
// }

const session_driver_results = await notion.dataSources.query({
	data_source_id: SESSION_DRIVER_RESULTS_DB,
	filter: {
		property: "Session Key",
		rollup: { any: { number: { equals: session_key } } },
	},
});

for (const result of session_driver_results.results) {
	if (isFullPage(result)) {
		const driverProp = result.properties["Driver Tag"];
		const gainedProp = result.properties["Gained/Lost"];
		const finProp = result.properties["Finish Position"];
		const statusProp = result.properties["Status"];
		let driverTag: string | undefined;
		let gained = 0;
		let finishPosition: number | string | undefined;
		if (
			driverProp.type === "rollup" &&
			driverProp.rollup.type === "array" &&
			driverProp.rollup.array[0].type === "rich_text"
		) {
			driverTag = driverProp.rollup.array[0].rich_text[0].plain_text;
		}

		if (
			gainedProp.type === "formula" &&
			gainedProp.formula.type === "number" &&
			gainedProp.formula.number
		) {
			gained = gainedProp.formula.number;
		}

		if (finProp?.type === "number" && finProp.number) {
			finishPosition = finProp.number;
		} else if (statusProp?.type === "select" && statusProp.select) {
			finishPosition = statusProp.select.name;
		}

		console.log(`driverTag: ${driverTag}, gained: ${gained}, finishPosition: ${finishPosition}`);
	}
}
