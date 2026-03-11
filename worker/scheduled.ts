import { lockPredictionReminder } from "./scheduled_events/lockReminder";
import type { Bindings } from "./types";

export async function handleScheduled(_event: ScheduledEvent, env: Bindings) {
	console.log("[scheduled] cron triggered at", new Date().toISOString());

	await lockPredictionReminder(env);
}
