import { AnimatePresence, motion } from "framer-motion";
import { LockIcon, TrophyIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Flag } from "@/components/flags";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { RACES_2026 } from "@/data";
import { cn } from "@/lib/utils";
import type { Race } from "@/shared/Race";
import CountDown from "./Countdown";
import { AppLayout } from "./Layout";
import { SessionResults } from "./Race";

const container = {
	hidden: {},
	show: { transition: { staggerChildren: 0.03 } },
};

const item = {
	hidden: { opacity: 0, y: 8, x: 40 },
	show: { opacity: 1, y: 0, x: 0, transition: { duration: 0.3 } },
};

export function RaceWeekend() {
	const nextRace = RACES_2026.find((race) => race.date && new Date(race.date) >= new Date());
	return (
		<AppLayout headline="Race Calendar">
			<motion.ul
				variants={container}
				initial="hidden"
				animate="show"
				className="flex flex-col divide-y divide-border"
			>
				{RACES_2026.map((race) => (
					<RaceRow key={race.round} race={race} isNext={race.round === nextRace?.round} />
				))}
			</motion.ul>
		</AppLayout>
	);
}

function RaceRow({ race, isNext }: { race: Race; isNext: boolean }) {
	const [isHovered, setIsHovered] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const isUpcoming = race.isUpcoming();
	const race_session = race.getSession("Race");
	const isOngoing = race.isOngoing();

	if (!race_session) return null;

	return (
		<motion.li
			variants={item}
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => {
				if (!isDialogOpen) setIsHovered(false);
			}}
		>
			<div className="w-full justify-between flex items-center gap-2 md:gap-4 px-3 hover:text-muted-foreground transition-colors duration-200 hover:bg-secondary">
				<Link
					to={`/race/${race.circuit_code}`}
					className="flex py-3 items-baseline gap-2 md:gap-4 shrink truncate"
				>
					<span
						className={cn(`w-6 shrink-0 text-xl md:text-4xl font-thin tabular-nums md:mr-4`, {
							"text-accent-foreground/70": isNext,
							"text-accent-foreground": isOngoing,
						})}
					>
						{race.round.toString().padStart(2, "0")}
					</span>
					<Flag
						className="size-4 md:size-7 border-border scale-95 translate-y-0.5 rounded-full object-cover shadow-sm"
						countryCode={race.country}
					/>
					<div
						className={cn("font-medium text-xl md:text-4xl", {
							"text-accent-foreground": isNext,
							"text-accent-foreground animate-pulse": isOngoing,
							"text-muted-foreground": !isUpcoming && !isOngoing,
						})}
					>
						{race.name}
					</div>
					<AnimatePresence mode="wait" initial={false}>
						{isHovered ? (
							<motion.div
								key="daterange"
								className="flex-1 min-w-0 truncate"
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								transition={{ duration: 0.15 }}
							>
								<p className="text-sm md:text-2xl font-thin text-muted-foreground truncate">
									{race.getDateRange()}
								</p>
							</motion.div>
						) : (
							<motion.div
								key="venue"
								className="shrink hidden md:block min-w-0 truncate"
								initial={{ opacity: 0, x: -12 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.15 }}
							>
								<p className="text-sm text-muted-foreground truncate font-thin">{race.venue}</p>
							</motion.div>
						)}
					</AnimatePresence>
				</Link>
				<div className="shrink-0">
					<AnimatePresence mode="wait" initial={false}>
						{isHovered && (
							<motion.span
								key="hovered"
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								transition={{ duration: 0.15 }}
							>
								{isUpcoming ? (
									<Link
										className="flex items-center gap-2"
										to={`/race/${race.circuit_code}${isNext ? "/prediction" : ""}`}
									>
										{isNext && <LockIcon className="size-6 text-accent-foreground" />}
										<CountDown
											size="sm"
											variant="ghost"
											date={isNext ? race.getPredictionLockDate() : race.getRaceStartDate()}
											className={isNext ? "text-accent-foreground" : ""}
										/>
									</Link>
								) : (
									<Dialog
										onOpenChange={(open) => {
											setIsDialogOpen(open);
											if (!open) setIsHovered(false);
										}}
									>
										<DialogTrigger asChild>
											<TrophyIcon className="size-6 text-orange-300 hover:text-orange-400 transition-colors duration-200" />
										</DialogTrigger>
										<DialogContent className="md:max-w-[calc(100%-6rem)] xl:max-w-7xl">
											<SessionResults session={race_session} />
										</DialogContent>
									</Dialog>
								)}
							</motion.span>
						)}
						{!isHovered && (
							<motion.span
								key="idle"
								initial={{ opacity: 0, x: -12 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.15 }}
								className="text-sm md:text-2xl font-thin text-muted-foreground"
							>
								<Link to={`/race/${race.circuit_code}`}>{race.getDateRange()}</Link>
							</motion.span>
						)}
					</AnimatePresence>
				</div>
			</div>
		</motion.li>
	);
}
