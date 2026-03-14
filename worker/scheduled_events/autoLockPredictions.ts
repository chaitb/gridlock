import { RACES_2026 } from "@/data";
import { initialPredictions, type PredictionContent } from "@/shared/model";
import { getCompletePrediction } from "@/shared/predictionFormHelpers";
import { type EmailPayload, sendBatchEmails } from "../email";
import { markEventEmailSent, wasEventEmailSent } from "../queries/eventEmailQueries";
import {
	getUnlockedPredictionsByRace,
	updatePredictionAndLock,
} from "../queries/predictionQueries";
import type { Bindings } from "../types";

const AUTO_LOCK_EVENT = "auto_lock_predictions";
const HOURS_AFTER_LOCK = 4;

function getHoursSince(date: Date): number {
	return (Date.now() - date.getTime()) / (1000 * 60 * 60);
}

function findRecentlyClosedRace() {
	return RACES_2026.find((race) => {
		const lockDate = race.getPredictionLockDate();
		const hoursSince = getHoursSince(lockDate);
		return hoursSince >= 0 && hoursSince <= HOURS_AFTER_LOCK;
	});
}

function buildAutoLockEmail(appUrl: string, raceName: string, circuitCode: string): EmailPayload {
	const predictionUrl = `${appUrl}/race/${circuitCode}/prediction`;

	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${raceName} predictions auto-locked</title>
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
                ${raceName} predictions auto-locked
              </h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#888;">
                The prediction window for the <strong style="color:#f0f0f0;">${raceName}</strong> has closed. Since you hadn't locked your predictions, we've auto-locked them with random selections so you can still compete.
              </p>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#888;">
                You can view your predictions below.
              </p>

              <a href="${predictionUrl}"
                 style="display:inline-block;padding:14px 28px;background:#e10600;color:#fff;font-size:14px;font-weight:600;letter-spacing:0.04em;text-decoration:none;border-radius:8px;">
                View Your Predictions
              </a>

              <p style="margin:32px 0 0;font-size:12px;color:#555;line-height:1.6;">
                You're receiving this because your predictions were auto-locked when the window closed.
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
		subject: `${raceName} predictions auto-locked`,
		html,
	};
}

export async function autoLockPredictions(env: Bindings) {
	console.log("[autoLock] checking for races that closed in the last 4 hours");

	const race = findRecentlyClosedRace();

	if (!race) {
		console.log("[autoLock] no races closed recently");
		return;
	}

	const alreadyProcessed = await wasEventEmailSent(
		env.F1_PREDICTIONS,
		AUTO_LOCK_EVENT,
		"auto_lock",
		race.circuit_code
	);

	if (alreadyProcessed) {
		console.log(`[autoLock] already processed for ${race.name}, skipping`);
		return;
	}

	const unlockedPredictions = await getUnlockedPredictionsByRace(
		env.F1_PREDICTIONS,
		race.circuit_code
	);

	console.log(
		`[autoLock] found ${unlockedPredictions.length} unlocked predictions for ${race.name}`
	);

	if (unlockedPredictions.length === 0) {
		await markEventEmailSent(
			env.F1_PREDICTIONS,
			AUTO_LOCK_EVENT,
			"auto_lock",
			race.circuit_code,
			true
		);
		console.log("[autoLock] no unlocked predictions, marked as processed");
		return;
	}

	const emails: EmailPayload[] = [];

	for (const pred of unlockedPredictions) {
		let prediction: PredictionContent;
		if (pred.prediction) {
			try {
				prediction = JSON.parse(pred.prediction) as PredictionContent;
			} catch {
				prediction = initialPredictions;
			}
		} else {
			prediction = initialPredictions;
		}

		const completePrediction = getCompletePrediction(prediction);

		await updatePredictionAndLock(
			env.F1_PREDICTIONS,
			pred.user_id,
			race.circuit_code,
			JSON.stringify(completePrediction)
		);

		const emailTemplate = buildAutoLockEmail(env.APP_URL, race.name, race.circuit_code);
		emails.push({
			...emailTemplate,
			to: pred.email,
		});

		console.log(`[autoLock] auto-locked prediction for user ${pred.user_id}`);
	}

	const result = await sendBatchEmails(env.RESEND_API_KEY, emails);

	if (!result.ok) {
		console.error(`[autoLock] batch send failed for ${race.name}:`, result.error);
		await markEventEmailSent(
			env.F1_PREDICTIONS,
			AUTO_LOCK_EVENT,
			"auto_lock",
			race.circuit_code,
			false
		);
		return;
	}

	console.log(`[autoLock] sent ${emails.length} auto-lock emails for ${race.name}`);
	await markEventEmailSent(
		env.F1_PREDICTIONS,
		AUTO_LOCK_EVENT,
		"auto_lock",
		race.circuit_code,
		true
	);

	console.log("[autoLock] finished");
}
