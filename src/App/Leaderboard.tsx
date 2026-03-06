import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "./Layout";

type PlayerRow = {
	rank: number;
	username: string;
	points: number;
};

const container = {
	hidden: {},
	show: { transition: { staggerChildren: 0.04 } },
};

const item = {
	hidden: { opacity: 0, x: -6 },
	show: { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

export function Leaderboard() {
	const [rows, setRows] = useState<PlayerRow[]>([]);
	const [status, setStatus] = useState<"loading" | "error" | "ok">("loading");

	useEffect(() => {
		fetch("/api/leaderboard")
			.then((r) => {
				if (!r.ok) throw new Error("Failed to load");
				return r.json() as Promise<{ players: PlayerRow[] }>;
			})
			.then((data) => {
				setRows(data.players);
				setStatus("ok");
			})
			.catch(() => setStatus("error"));
	}, []);

	return (
		<AppLayout>
			<h1 className="mt-8 mb-6 text-3xl font-medium tracking-tight">Leaderboard</h1>

			{status === "loading" && <p className="text-muted-foreground text-sm">Loading…</p>}
			{status === "error" && (
				<p className="text-destructive text-sm">Could not load leaderboard.</p>
			)}
			{status === "ok" && rows.length === 0 && (
				<p className="text-muted-foreground text-sm">No players yet.</p>
			)}
			{status === "ok" && rows.length > 0 && (
				<motion.ul
					variants={container}
					initial="hidden"
					animate="show"
					className="flex flex-col divide-y divide-border"
				>
					{rows.map((row) => (
						<motion.li key={row.username} variants={item} className="flex items-center gap-4 py-3">
							<span className="w-6 shrink-0 text-xs text-muted-foreground tabular-nums">
								{row.rank}
							</span>
							<span className="flex-1 font-medium">{row.username}</span>
							<span className="shrink-0 tabular-nums text-sm">
								{row.points} <span className="text-muted-foreground">pts</span>
							</span>
						</motion.li>
					))}
				</motion.ul>
			)}
		</AppLayout>
	);
}
