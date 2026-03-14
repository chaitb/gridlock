import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { RACES_2026 } from "@/data";
import { useApi } from "@/helpers/useApi";
import type { User } from "@/shared/model";
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
				<H2>Users</H2>
				<AllUsersTable />
				<H2>Score Race</H2>
				<ScoreRace />
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

type ScoreResult = { userId: number; score: number; exactMatches: number };
type ScoreResponse = { scored: number; results: ScoreResult[] };

const ScoreRace = () => {
	const [circuitCode, setCircuitCode] = useState<string>("");
	const [scoreLoading, setScoreLoading] = useState(false);
	const [scoreStatus, setScoreStatus] = useState<Status>(null);
	const [scoreResults, setScoreResults] = useState<ScoreResult[]>([]);

	async function handleScore() {
		if (!circuitCode) return;
		setScoreLoading(true);
		setScoreStatus(null);
		setScoreResults([]);
		try {
			const res = await fetch("/api/admin/score", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ circuitCode }),
			});
			const body = (await res.json()) as ScoreResponse & { message?: string };
			if (!res.ok) {
				setScoreStatus({ ok: false, message: body.message ?? "Failed to score race" });
				return;
			}
			setScoreStatus({ ok: true, message: `Scored ${body.scored} predictions` });
			setScoreResults(body.results ?? []);
		} catch (err) {
			setScoreStatus({
				ok: false,
				message: err instanceof Error ? err.message : "Unknown error",
			});
		} finally {
			setScoreLoading(false);
		}
	}

	return (
		<div className="space-y-3">
			<p className="text-sm text-muted-foreground">
				Select a race and run scoring against locked predictions.
			</p>
			<div className="flex items-center gap-3">
				<Select value={circuitCode} onValueChange={setCircuitCode}>
					<SelectTrigger className="w-64">
						<SelectValue placeholder="Select a race" />
					</SelectTrigger>
					<SelectContent>
						{RACES_2026.map((race) => (
							<SelectItem key={race.circuit_code} value={race.circuit_code}>
								R{race.round} — {race.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button
					variant="outline"
					size="sm"
					disabled={!circuitCode || scoreLoading}
					onClick={handleScore}
				>
					{scoreLoading ? "Scoring..." : "Score"}
				</Button>
			</div>
			{scoreStatus && (
				<p className={`text-xs ${scoreStatus.ok ? "text-green-400" : "text-red-400"}`}>
					{scoreStatus.message}
				</p>
			)}
			{scoreResults.length > 0 && (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>User ID</TableHead>
							<TableHead className="text-right">Score</TableHead>
							<TableHead className="text-right">Exact Matches</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{scoreResults.map((r) => (
							<TableRow key={r.userId}>
								<TableCell>{r.userId}</TableCell>
								<TableCell className="text-right font-medium">{r.score}</TableCell>
								<TableCell className="text-right">{r.exactMatches}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
};

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
