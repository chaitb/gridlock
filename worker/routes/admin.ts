import type { Context } from "hono";
import { z } from "zod";
import { sendEmail, sendMagicLinkEmail } from "../email";
import { findUserById } from "../queries/userQueries";
import { buildReminderEmail } from "../scheduled_events/lockReminder";
import type { AppEnv } from "../types";

const ADMIN_EMAILS = [
	"chaitanya@chaitanyabhagwat.com",
	"chaitwheels@gmail.com",
	"chai.bhagwat@gmail.com",
];

const adminActionSchema = z.discriminatedUnion("action", [
	z.object({
		action: z.literal("test_email"),
		args: z.object({
			template: z.enum(["magic_link", "lock_reminder"]),
		}),
	}),
]);

export async function adminAction(c: Context<AppEnv>) {
	const userId = c.get("userId");
	const user = await findUserById(c.env.F1_PREDICTIONS, userId);

	if (!user || !ADMIN_EMAILS.includes(user.email)) {
		return c.json({ message: "Unauthorized" }, 403);
	}

	const body = await c.req.json().catch(() => null);
	const parsed = adminActionSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ message: "Invalid request", errors: parsed.error.issues }, 400);
	}

	const { action, args } = parsed.data;

	if (action === "test_email") {
		const to = user.email;

		if (args.template === "magic_link") {
			const testLink = `${c.env.APP_URL}/verify?token=test_token_preview`;
			await sendMagicLinkEmail(c.env.RESEND_API_KEY, to, testLink);
			return c.json({ message: `Sent magic_link preview to ${to}` });
		}

		if (args.template === "lock_reminder") {
			const lockDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
			const { to: _, ...email } = buildReminderEmail(
				c.env.APP_URL,
				"Australian Grand Prix",
				"melbourne",
				lockDate,
				24
			);
			await sendEmail(c.env.RESEND_API_KEY, { to, ...email });
			return c.json({ message: `Sent lock_reminder preview to ${to}` });
		}
	}

	return c.json({ message: "Unknown action" }, 400);
}
