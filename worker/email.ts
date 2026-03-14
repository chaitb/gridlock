import type { CreateBatchSuccessResponse, CreateEmailResponseSuccess } from "resend";
import { Resend } from "resend";
import type { AsyncResult } from "@/shared/Result";
import { ok } from "@/shared/Result";
import { withRetry } from "./retry";

export interface EmailPayload {
	to: string;
	subject: string;
	html: string;
}

const FROM = "GridLock <grid@gridlock.chaitanyabhagwat.com>";

export async function sendEmail(
	apiKey: string,
	options: {
		to: string | string[];
		subject: string;
		html: string;
	}
): AsyncResult<CreateEmailResponseSuccess> {
	return withRetry(async () => {
		const resend = new Resend(apiKey);

		const { data, error } = await resend.emails.send({
			from: FROM,
			to: options.to,
			subject: options.subject,
			html: options.html,
		});

		if (error) throw error;
		// biome-ignore lint/style/noNonNullAssertion: data is non-null when error is null (Resend SDK design)
		return data!;
	});
}

export async function sendBatchEmails(
	apiKey: string,
	emails: EmailPayload[]
): AsyncResult<CreateBatchSuccessResponse | null> {
	if (emails.length === 0) return ok(null);

	return withRetry(async () => {
		const resend = new Resend(apiKey);

		const batch = emails.map((email) => ({
			from: FROM,
			to: [email.to],
			subject: email.subject,
			html: email.html,
		}));

		const { data, error } = await resend.batch.send(batch);

		if (error) throw error;
		// biome-ignore lint/style/noNonNullAssertion: data is non-null when error is null (Resend SDK design)
		return data!;
	});
}

/**
 * Sends the magic login link email via Resend.
 * The link is valid for 15 minutes.
 */
export async function sendMagicLinkEmail(apiKey: string, to: string, magicLink: string) {
	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your GridLock login link</title>
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
                Your login link
              </h1>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#888;">
                Click the button below to log in to GridLock. This link expires in&nbsp;<strong style="color:#f0f0f0;">15&nbsp;minutes</strong>.
              </p>

              <a href="${magicLink}"
                 style="display:inline-block;padding:14px 28px;background:#e10600;color:#fff;font-size:14px;font-weight:600;letter-spacing:0.04em;text-decoration:none;border-radius:8px;">
                Log in to GridLock
              </a>

              <p style="margin:32px 0 0;font-size:12px;color:#555;line-height:1.6;">
                If you didn't request this, you can safely ignore this email — no account changes were made.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1e1e1e;">
              <p style="margin:0;font-size:11px;color:#444;">
                Or copy this link: <span style="color:#666;word-break:break-all;">${magicLink}</span>
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
		subject: "Your GridLock login link",
		html,
	});
}
