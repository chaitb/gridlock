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

	if (!race_session) return null;

	return (
		<motion.li
			variants={item}
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => {
				if (!isDialogOpen) setIsHovered(false);
			}}
		>
			<div className="flex items-center gap-4 px-3 hover:text-muted-foreground transition-colors duration-200 hover:bg-secondary">
				<Link to={`/race/${race.circuit_code}`} className="flex py-3 items-baseline gap-4 grow">
					<span className="w-6 shrink-0 text-xl md:text-4xl font-thin text-muted-foreground tabular-nums mr-4">
						{race.round.toString().padStart(2, "0")}
					</span>
					<Flag
						className="size-5 md:size-7 border-border scale-95 translate-y-0.5 rounded-full object-cover shadow-sm"
						countryCode={race.country}
					/>
					<div
						className={cn("font-medium text-xl md:text-4xl", {
							"text-accent-foreground": isNext,
							"text-muted-foreground": !isUpcoming,
						})}
					>
						{race.name}
					</div>
					<AnimatePresence mode="wait" initial={false}>
						{isHovered ? (
							<motion.div
								key="daterange"
								className="flex-1 min-w-0 overflow-hidden"
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								transition={{ duration: 0.15 }}
							>
								<p className="text-xl md:text-2xl font-thin text-muted-foreground truncate">
									{race.getDateRange()}
								</p>
							</motion.div>
						) : (
							<motion.div
								key="venue"
								className="flex-1 min-w-0 overflow-hidden"
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
				<span className="shrink-0">
					<AnimatePresence mode="wait" initial={false}>
						{isHovered && (
							<motion.span
								key="hovered"
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								transition={{ duration: 0.15 }}
								className="flex items-center gap-2"
							>
								{isUpcoming ? (
									<>
										{isNext && <LockIcon className="size-6 text-accent-foreground" />}
										<CountDown
											size="sm"
											variant="ghost"
											date={isNext ? race.getPredictionLockDate() : race.getRaceStartDate()}
											className={isNext ? "text-accent-foreground" : ""}
										/>
									</>
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
								className="text-xl md:text-2xl font-thin text-muted-foreground"
							>
								{race.getDateRange()}
							</motion.span>
						)}
					</AnimatePresence>
				</span>
			</div>
		</motion.li>
	);
}
