import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "./Layout";

type Template = {
	id: string;
	label: string;
	description: string;
};

const TEMPLATES: Template[] = [
	{
		id: "magic_link",
		label: "Magic Link",
		description: "Login email sent to users when they request a magic link.",
	},
	{
		id: "lock_reminder",
		label: "Lock Reminder",
		description: "Reminder email sent ~24h before predictions lock for a race.",
	},
];

type Status = { ok: boolean; message: string } | null;

export function Admin() {
	const [statuses, setStatuses] = useState<Record<string, Status>>({});
	const [loading, setLoading] = useState<Record<string, boolean>>({});

	async function sendTest(template: string) {
		setLoading((l) => ({ ...l, [template]: true }));
		setStatuses((s) => ({ ...s, [template]: null }));
		try {
			const res = await fetch("/api/admin", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "test_email", args: { template } }),
			});
			const body = (await res.json()) as { message: string };
			setStatuses((s) => ({ ...s, [template]: { ok: res.ok, message: body.message } }));
		} catch (err) {
			setStatuses((s) => ({
				...s,
				[template]: { ok: false, message: err instanceof Error ? err.message : "Unknown error" },
			}));
		} finally {
			setLoading((l) => ({ ...l, [template]: false }));
		}
	}

	return (
		<AppLayout headline="Admin">
			<div className="px-3 mt-4 space-y-4">
				<p className="text-sm text-muted-foreground">
					Send test emails to your account to preview templates.
				</p>
				{TEMPLATES.map((t) => {
					const status = statuses[t.id];
					const isLoading = loading[t.id];
					return (
						<div
							key={t.id}
							className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card"
						>
							<div>
								<p className="font-medium">{t.label}</p>
								<p className="text-sm text-muted-foreground">{t.description}</p>
								{status && (
									<p className={`text-xs mt-1 ${status.ok ? "text-green-400" : "text-red-400"}`}>
										{status.message}
									</p>
								)}
							</div>
							<Button
								variant="outline"
								size="sm"
								disabled={isLoading}
								onClick={() => sendTest(t.id)}
							>
								{isLoading ? "Sending..." : "Send test"}
							</Button>
						</div>
					);
				})}
			</div>
		</AppLayout>
	);
}
