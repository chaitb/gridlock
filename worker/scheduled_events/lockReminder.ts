import { RACES_2026 } from "@/data";
import { sendEmail } from "../email";
import { markEventEmailSent, wasEventEmailSent } from "../queries/eventEmailQueries";
import { getVerifiedUsersWithoutLockedPrediction } from "../queries/userQueries";
import type { Bindings } from "../types";

const EVENT_NAME = "lock_prediction_reminder";
const EMAIL_TYPE = "reminder";

function isWithinHours(date: Date, hoursFrom: number, hoursTo: number): boolean {
	const now = new Date();
	const diffMs = date.getTime() - now.getTime();
	const diffHours = diffMs / (1000 * 60 * 60);
	return diffHours >= hoursFrom && diffHours <= hoursTo;
}

export async function sendLockReminderEmail(
	apiKey: string,
	appUrl: string,
	to: string,
	raceName: string,
	circuitCode: string,
	lockDate: Date
) {
	const lockDateStr = lockDate.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
		timeZoneName: "short",
	});

	const predictionUrl = `${appUrl}/race/${circuitCode}/prediction`;

	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${raceName} predictions closing soon</title>
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
                ${raceName} predictions close soon
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

	return sendEmail(apiKey, {
		to,
		subject: `${raceName} predictions close soon — lock your picks!`,
		html,
	});
}

export async function lockPredictionReminder(env: Bindings) {
	console.log("[lockReminder] checking for races with predictions closing in 23-25 hours");

	const now = new Date();
	console.log("[lockReminder] current time:", now.toISOString());

	for (const race of RACES_2026) {
		const lockDate = race.getPredictionLockDate();
		const isWithinWindow = isWithinHours(lockDate, 23, 25);

		console.log(
			`[lockReminder] ${race.name} - lock date: ${lockDate.toISOString()}, in window: ${isWithinWindow}`
		);

		if (!isWithinWindow) continue;

		const alreadySent = await wasEventEmailSent(
			env.F1_PREDICTIONS,
			EVENT_NAME,
			EMAIL_TYPE,
			race.circuit_code
		);

		if (alreadySent) {
			console.log(`[lockReminder] reminder already sent for ${race.name}, skipping`);
			continue;
		}

		console.log(`[lockReminder] ${race.name} is within the 23-25 hour window`);

		const users = await getVerifiedUsersWithoutLockedPrediction(
			env.F1_PREDICTIONS,
			race.circuit_code
		);

		console.log(
			`[lockReminder] found ${users.length} users without locked predictions for ${race.name}`
		);

		if (users.length === 0) {
			await markEventEmailSent(env.F1_PREDICTIONS, EVENT_NAME, EMAIL_TYPE, race.circuit_code, true);
			continue;
		}

		const results = await Promise.allSettled(
			users.map((user) =>
				sendLockReminderEmail(
					env.RESEND_API_KEY,
					env.APP_URL,
					user.email,
					race.name,
					race.circuit_code,
					lockDate
				)
			)
		);

		let allSucceeded = true;
		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			const user = users[i];
			if (result.status === "fulfilled") {
				console.log(`[lockReminder] email sent to ${user.email} for ${race.name}`);
			} else {
				allSucceeded = false;
				console.error(
					`[lockReminder] failed to send email to ${user.email} for ${race.name}:`,
					result.reason
				);
			}
		}

		await markEventEmailSent(
			env.F1_PREDICTIONS,
			EVENT_NAME,
			EMAIL_TYPE,
			race.circuit_code,
			allSucceeded
		);
		console.log(
			`[lockReminder] marked event_email sent for ${race.name} (success: ${allSucceeded})`
		);
	}

	console.log("[lockReminder] finished processing all races");
}
