import type { D1Database } from "@cloudflare/workers-types";
// import { sendEmail } from "./email";

type Bindings = {
	F1_PREDICTIONS: D1Database;
	RESEND_API_KEY: string;
};

export async function handleScheduled(_event: ScheduledEvent, _env: Bindings) {
	console.log("[scheduled] cron triggered at", new Date().toISOString());

	// TODO: Add your cron logic here
	// Example: Check for upcoming races and send reminder emails

	// Example: Send reminder for races in next 24 hours
	// const upcomingRaces = await getUpcomingRaces(env.F1_PREDICTIONS);
	// for (const race of upcomingRaces) {
	//   const users = await getUsersWithUnlockedPredictions(env.F1_PREDICTIONS, race.circuit_code);
	//   for (const user of users) {
	//     await sendEmail(env.RESEND_API_KEY, {
	//       to: user.email,
	//       subject: `Reminder: ${race.name} predictions close soon!`,
	//       html: `<p>Don't forget to lock your predictions for ${race.name}!</p>`,
	//     });
	//   }
	// }
}
