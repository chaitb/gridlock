import type { D1Database } from "@cloudflare/workers-types";

export async function wasEventEmailSent(
	db: D1Database,
	event: string,
	type: string,
	race: string
): Promise<boolean> {
	const result = await db
		.prepare(
			"SELECT id FROM event_emails WHERE event = ? AND type = ? AND race = ? AND sent = 1 LIMIT 1"
		)
		.bind(event, type, race)
		.first();
	return result !== null;
}

export async function markEventEmailSent(
	db: D1Database,
	event: string,
	type: string,
	race: string,
	sent: boolean = true
): Promise<void> {
	await db
		.prepare(
			"INSERT INTO event_emails (event, type, sent, race, sent_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)"
		)
		.bind(event, type, sent ? 1 : 0, race)
		.run();
}
