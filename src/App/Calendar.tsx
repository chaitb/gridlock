import { motion } from "framer-motion";
import { Link } from "wouter";
import { Flag } from "@/components/flags";
import { cn } from "@/lib/utils";
import { AppLayout } from "./Layout";
import { RACES_2026, SESSIONS } from "@/data";
import type { Race } from "@/model";

const container = {
	hidden: {},
	show: { transition: { staggerChildren: 0.05 } },
};

const item = {
	hidden: { opacity: 0, y: 8 },
	show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function RaceWeekend() {
	const today = new Date();
	const races = RACES_2026.map((race) => {
		return { ...race, isUpcoming: new Date(race.date) >= today };
	});
	const nextRace = races.find((race) => race.isUpcoming);
	return (
		<AppLayout headline="Race Calendar">
			<motion.ul
				variants={container}
				initial="hidden"
				animate="show"
				className="flex flex-col divide-y divide-border"
			>
				{races.map((race) => (
					<motion.li key={race.round} variants={item}>
						<Link
							to={`/race/${race.circuit_code}`}
							className="flex items-baseline gap-4 p-3 hover:text-muted-foreground transition-colors duration-200 hover:bg-secondary"
						>
							<span className="w-6 shrink-0 text-xl md:text-4xl font-thin text-muted-foreground tabular-nums mr-4">
								{race.round.toString().padStart(2, "0")}
							</span>
							<Flag
								className="size-5 md:size-7 border-border scale-95 translate-y-0.5 rounded-full object-cover shadow-sm"
								countryCode={race.country}
							/>
							<div
								className={cn("font-medium text-xl md:text-4xl", {
									"text-accent-foreground": race.round === nextRace?.round,
									"text-muted-foreground": !race.isUpcoming,
								})}
							>
								{race.name}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm text-muted-foreground truncate font-thin">{race.venue}</p>
							</div>
							<span className="shrink-0 text-xl md:text-2xl font-thin text-muted-foreground">
								{dateRange(race)}
							</span>
						</Link>
					</motion.li>
				))}
			</motion.ul>
		</AppLayout>
	);
}

function dateRange(race: Race): string {
	const sessions = SESSIONS.filter((s) => s.circuit_code === race.circuit_code).sort(
		(a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
	);
	if (sessions.length === 0) {
		return "—";
	}
	if (sessions.length === 1) {
		return new Date(sessions[0].date_start).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	}
	const start = new Date(sessions[0].date_start);
	const end = new Date(sessions[sessions.length - 1].date_end);
	if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
		return `${start.toLocaleDateString("en-US", {
			day: "numeric",
		})} - ${end.toLocaleDateString("en-US", {
			day: "numeric",
		})} ${end.toLocaleDateString("en-US", {
			month: "short",
		})}`;
	}
	return `${start.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	})} - ${end.toLocaleDateString("en-US", {
		day: "numeric",
		month: "short",
	})}`;
}
