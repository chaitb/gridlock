import { motion } from "framer-motion";
import { Link } from "wouter";
import { useUser } from "@/context/useUser";
import { useApi } from "@/helpers/useApi";
import { cn } from "@/lib/utils";
import { AppLayout } from "./Layout";

type PlayerRow = {
	rank: number;
	username: string;
	points: number;
	exact_matches: number;
	races_scored: number;
};

const container = {
	hidden: {},
	show: { transition: { staggerChildren: 0.04 } },
};

const item = {
	hidden: { opacity: 0, x: -6 },
	show: { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

const RANK_STYLES: Record<number, { label: string; className: string }> = {
	1: { label: "1st", className: "text-amber-400 font-bold" },
	2: { label: "2nd", className: "text-zinc-400 font-bold" },
	3: { label: "3rd", className: "text-amber-700 font-bold" },
};

export function Leaderboard() {
	const { user } = useUser();
	const { data, isLoading, error } = useApi<{ players: PlayerRow[] }>("/api/leaderboard");

	const rows = data?.players ?? [];
	const scored = rows.filter((r) => r.points > 0);
	const unscored = rows.filter((r) => r.points === 0);

	return (
		<AppLayout headline="Leaderboard">
			<div className="mx-3 space-y-6">
				{isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
				{error && <p className="text-muted-foreground text-sm">Coming Soon!</p>}

				{!isLoading && !error && rows.length === 0 && (
					<p className="text-muted-foreground text-sm">No players yet.</p>
				)}

				{!isLoading && !error && scored.length > 0 && (
					<div>
						<div className="grid grid-cols-[2rem_1fr_auto] gap-x-4 px-2 pb-1 text-xs text-muted-foreground uppercase tracking-wider">
							<span>#</span>
							<span>Player</span>
							<span className="text-right">Score</span>
						</div>
						<motion.ul
							variants={container}
							initial="hidden"
							animate="show"
							className="flex flex-col divide-y divide-border"
						>
							{scored.map((row) => {
								const isMe = user?.username === row.username;
								const rankStyle = RANK_STYLES[row.rank];
								return (
									<motion.li
										key={row.username}
										variants={item}
										className={cn(
											"grid grid-cols-[2rem_1fr_auto] gap-x-4 items-center py-3 px-2 rounded",
											isMe && "bg-muted/40"
										)}
									>
										<span
											className={cn(
												"text-sm tabular-nums text-muted-foreground",
												rankStyle?.className
											)}
										>
											{row.rank}
										</span>
										<div className="min-w-0">
											<Link
												to={`/${row.username}/predictions`}
												className="font-medium hover:underline underline-offset-2 truncate block"
											>
												{row.username}
												{isMe && (
													<span className="ml-2 text-xs text-muted-foreground font-normal">
														you
													</span>
												)}
											</Link>
											<p className="text-xs text-muted-foreground">
												{row.races_scored} {row.races_scored === 1 ? "race" : "races"} &middot;{" "}
												{row.exact_matches} exact
											</p>
										</div>
										<div className="text-right shrink-0">
											<span className="tabular-nums font-medium text-sm">{row.points}</span>
											<span className="text-muted-foreground text-xs"> pts</span>
										</div>
									</motion.li>
								);
							})}
						</motion.ul>
					</div>
				)}

				{!isLoading && !error && unscored.length > 0 && (
					<div>
						<p className="text-xs text-muted-foreground uppercase tracking-wider px-2 pb-1">
							Not yet scored
						</p>
						<motion.ul
							variants={container}
							initial="hidden"
							animate="show"
							className="flex flex-col divide-y divide-border"
						>
							{unscored.map((row) => {
								const isMe = user?.username === row.username;
								return (
									<motion.li
										key={row.username}
										variants={item}
										className={cn(
											"flex items-center gap-4 py-2 px-2 rounded",
											isMe && "bg-muted/40"
										)}
									>
										<span className="w-6 shrink-0 text-xs text-muted-foreground">—</span>
										<Link
											to={`/${row.username}/predictions`}
											className="flex-1 text-sm text-muted-foreground hover:underline underline-offset-2 truncate"
										>
											{row.username}
											{isMe && <span className="ml-2 text-xs">(you)</span>}
										</Link>
									</motion.li>
								);
							})}
						</motion.ul>
					</div>
				)}
			</div>
		</AppLayout>
	);
}
