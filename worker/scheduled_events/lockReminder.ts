import { RACES_2026 } from "@/data";
import { type EmailPayload, sendBatchEmails } from "../email";
import { markEventEmailSent, wasEventEmailSent } from "../queries/eventEmailQueries";
import { getVerifiedUsersWithoutLockedPrediction } from "../queries/userQueries";
import type { Bindings } from "../types";

const REMINDER_WINDOWS = [
	{ event: "lock_prediction_reminder_24h", hoursFrom: 23, hoursTo: 25 },
	{ event: "lock_prediction_reminder_2h", hoursFrom: 1, hoursTo: 3 },
] as const;

function getHoursUntil(date: Date): number {
	return (date.getTime() - Date.now()) / (1000 * 60 * 60);
}

function findActiveRace() {
	return RACES_2026.find((race) => {
		const lockDate = race.getPredictionLockDate();
		const hours = getHoursUntil(lockDate);
		return REMINDER_WINDOWS.some((w) => hours >= w.hoursFrom && hours <= w.hoursTo);
	});
}

function getActiveWindow(lockDate: Date) {
	const hours = getHoursUntil(lockDate);
	return REMINDER_WINDOWS.find((w) => hours >= w.hoursFrom && hours <= w.hoursTo);
}

export function buildReminderEmail(
	appUrl: string,
	raceName: string,
	circuitCode: string,
	lockDate: Date,
	hoursUntil: number
): EmailPayload {
	const lockDateStr = lockDate.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
		timeZoneName: "short",
	});

	const predictionUrl = `${appUrl}/race/${circuitCode}/prediction`;
	const timeDesc = hoursUntil > 10 ? "tomorrow" : "in a few hours";

	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${raceName} predictions closing ${timeDesc}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #1e1e1e;">
              <p style="margin:0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#666;">GridLock 2026</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#f0f0f0;letter-spacing:-0.5px;">
                ${raceName} predictions close ${timeDesc}
              </h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#888;">
                Predictions for the <strong style="color:#f0f0f0;">${raceName}</strong> will lock on <strong style="color:#f0f0f0;">${lockDateStr}</strong> — before qualifying begins.
              </p>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#888;">
                Make sure your picks are submitted and locked before then!
              </p>

              <a href="${predictionUrl}"
                 style="display:inline-block;padding:14px 28px;background:#e10600;color:#fff;font-size:14px;font-weight:600;letter-spacing:0.04em;text-decoration:none;border-radius:8px;">
                ${raceName} Predictions
              </a>

              <p style="margin:32px 0 0;font-size:12px;color:#555;line-height:1.6;">
                You're receiving this because you haven't locked your predictions for this race yet.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1e1e1e;">
              <p style="margin:0;font-size:11px;color:#444;">
                Or copy this link: <span style="color:#666;word-break:break-all;">${predictionUrl}</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

	return {
		to: "",
		subject: `${raceName} predictions close ${timeDesc} — lock your picks!`,
		html,
	};
}

export async function lockPredictionReminder(env: Bindings) {
	console.log("[lockReminder] checking for races with predictions closing soon");

	const race = findActiveRace();

	if (!race) {
		console.log("[lockReminder] no races in reminder window");
		return;
	}

	const lockDate = race.getPredictionLockDate();
	const window = getActiveWindow(lockDate);

	if (!window) {
		console.log("[lockReminder] race found but no matching window");
		return;
	}

	const hoursUntil = getHoursUntil(lockDate);
	console.log(
		`[lockReminder] ${race.name} - lock date: ${lockDate.toISOString()}, hours until: ${hoursUntil.toFixed(1)}h`
	);

	const alreadySent = await wasEventEmailSent(
		env.F1_PREDICTIONS,
		window.event,
		"reminder",
		race.circuit_code
	);

	if (alreadySent) {
		console.log(`[lockReminder] ${window.event} already sent for ${race.name}, skipping`);
		return;
	}

	const users = await getVerifiedUsersWithoutLockedPrediction(
		env.F1_PREDICTIONS,
		race.circuit_code
	);

	console.log(
		`[lockReminder] found ${users.length} users without locked predictions for ${race.name}`
	);

	if (users.length === 0) {
		await markEventEmailSent(env.F1_PREDICTIONS, window.event, "reminder", race.circuit_code, true);
		console.log(`[lockReminder] no users to notify, marked ${window.event} as sent`);
		return;
	}

	const { subject, html } = buildReminderEmail(
		env.APP_URL,
		race.name,
		race.circuit_code,
		lockDate,
		hoursUntil
	);

	const emails = users.map((user) => ({
		to: user.email,
		subject,
		html,
	}));

	try {
		await sendBatchEmails(env.RESEND_API_KEY, emails);
		console.log(`[lockReminder] batch sent to ${users.length} users for ${race.name}`);
		await markEventEmailSent(env.F1_PREDICTIONS, window.event, "reminder", race.circuit_code, true);
	} catch (error) {
		console.error(`[lockReminder] batch send failed for ${race.name}:`, error);
		await markEventEmailSent(
			env.F1_PREDICTIONS,
			window.event,
			"reminder",
			race.circuit_code,
			false
		);
	}

	console.log("[lockReminder] finished");
}
