import { motion } from "framer-motion";
import { Link } from "wouter";
import { Flag } from "@/components/flags";
import { cn } from "@/lib/utils";
import { AppLayout } from "./Layout";
import { RACES_2026 } from "@/data";

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
								{race.date.toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								})}
							</span>
						</Link>
					</motion.li>
				))}
			</motion.ul>
		</AppLayout>
	);
}
