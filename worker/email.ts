import { Resend } from "resend";

export async function sendEmail(
	apiKey: string,
	options: {
		to: string | string[];
		subject: string;
		html: string;
	},
) {
	const resend = new Resend(apiKey);

	const { data, error } = await resend.emails.send({
		from: "GridLock <grid@gridlock.chaitanyabhagwat.com>",
		to: options.to,
		subject: options.subject,
		html: options.html,
	});

	if (error) {
		console.error("[email] failed to send", error);
		return { success: false, error };
	}

	return { success: true, data };
}
