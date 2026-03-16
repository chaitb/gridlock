import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useApi } from "@/helpers/useApi";
import type { User } from "@/shared/model";
import { ScoreRace } from "./Admin/AdminScoresTable";
import { AppLayout } from "./Layout";
import { H2 } from "./Text";

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
	const [leaderboardStatus, setLeaderboardStatus] = useState<Status>(null);
	const [leaderboardLoading, setLeaderboardLoading] = useState(false);

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

	async function recalculateLeaderboard() {
		setLeaderboardLoading(true);
		setLeaderboardStatus(null);
		try {
			const res = await fetch("/api/admin/recalculate-leaderboard", { method: "POST" });
			const body = (await res.json()) as { message: string; updated?: number };
			setLeaderboardStatus({ ok: res.ok, message: body.message });
		} catch (err) {
			setLeaderboardStatus({
				ok: false,
				message: err instanceof Error ? err.message : "Unknown error",
			});
		} finally {
			setLeaderboardLoading(false);
		}
	}

	return (
		<AppLayout headline="Admin">
			<div className="px-3 mt-4 space-y-4">
				<H2>Users</H2>
				<AllUsersTable />
				<H2>Score Race</H2>
				<ScoreRace />
				<H2>Leaderboard</H2>
				<div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card">
					<div>
						<p className="font-medium">Recalculate Leaderboard</p>
						<p className="text-sm text-muted-foreground">
							Sum all prediction scores per user (Melbourne excluded). Updates player_scores table.
						</p>
						{leaderboardStatus && (
							<p
								className={`text-xs mt-1 ${leaderboardStatus.ok ? "text-green-400" : "text-red-400"}`}
							>
								{leaderboardStatus.message}
							</p>
						)}
					</div>
					<Button
						variant="outline"
						size="sm"
						disabled={leaderboardLoading}
						onClick={recalculateLeaderboard}
					>
						{leaderboardLoading ? "Recalculating..." : "Recalculate"}
					</Button>
				</div>
				<H2>Send Test Emails</H2>
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

const AllUsersTable = () => {
	const { data: users, isLoading, error } = useApi<User[]>("/api/admin/users");

	if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
	if (error) return <p className="text-red-500">Error loading users</p>;
	if (!users || users.length === 0) return <p className="text-muted-foreground">No users found.</p>;

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>ID</TableHead>
					<TableHead>Username</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Verified</TableHead>
					<TableHead>Created</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{users.map((user) => (
					<TableRow key={user.id}>
						<TableCell>{user.id}</TableCell>
						<TableCell>{user.username ?? "—"}</TableCell>
						<TableCell>{user.email}</TableCell>
						<TableCell>
							{user.verified_at ? (
								<span className="text-green-400">Yes</span>
							) : (
								<span className="text-red-400">No</span>
							)}
						</TableCell>
						<TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};
