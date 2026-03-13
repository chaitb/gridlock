import { motion } from "framer-motion";
import {
	ClockIcon,
	DumbbellIcon,
	ListIcon,
	LockIcon,
	PencilLineIcon,
	TrophyIcon,
} from "lucide-react";
import type React from "react";
import { Link, useLocation, useParams } from "wouter";
import { EnterButton } from "@/components/EnterButton";
import GlareHover from "@/components/GlareHover";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { RACES_2026 } from "@/data";
import { useApi } from "@/helpers/useApi";
import { useMediaQuery } from "@/helpers/useMediaQuery";
import { cn } from "@/lib/utils";
import type {
	CircuitCode,
	Prediction,
	Race as RaceModel,
	Session,
	SessionResult,
} from "@/shared/model";
import { DriverCardCompact, DriverCardFull } from "./Drivers";
import { DRIVERS } from "./driver";
import { AppLayout } from "./Layout";
import { RaceHeader } from "./RaceHeader";

const SKELETON_KEYS = Array.from({ length: 22 }, (_, i) => `skeleton-${i}`);

import { H2 } from "./Text";

export function Race() {
	const params = useParams();
	const circuitCode = params.circuit_code;
	const race = RACES_2026.find((r) => r.circuit_code === circuitCode);

	if (!race) {
		return (
			<AppLayout>
				<p className="mt-8 text-sm text-muted-foreground">
					<Link to="/race" className="hover:underline">
						Race Calendar
					</Link>
					{" / "}Not found
				</p>
				<h1 className="mt-2 text-3xl font-medium tracking-tight">Race not found</h1>
			</AppLayout>
		);
	}

	return (
		<>
			<RaceHeader race={race} countdown={race.isUpcoming() && race.getRaceStartDate()} />
			<div className="mt-8 px-4 md:px-10">
				<Predictions circuitCode={race.circuit_code} />
			</div>
			<div className="mt-8 px-4 md:px-10 mb-20">
				<Schedule race={race} />
			</div>
		</>
	);
}

const glareButtonProps = {
	height: "80px",
	width: "100%",
	background: "transparent",
	hoverBackground: "rgba(255,255,255,0.06)",
	borderRadius: "12px",
	glareOpacity: 0.5,
	glareAngle: -70,
	glareSize: 400,
	transitionDuration: 2000,
	playOnce: false,
};

const Predictions: React.FC<{ circuitCode: CircuitCode }> = ({ circuitCode }) => {
	const [, _navigate] = useLocation();
	const { data: pred, error } = useApi<Prediction>(`/api/predictions`, {
		params: { circuitCode },
	});

	const hasPrediction = !!pred?.prediction;
	const isLocked = pred?.locked === 1;

	return (
		<motion.div
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.15, duration: 0.45 }}
			className="mt-4"
		>
			<H2>Predictions</H2>
			{error ? JSON.stringify(error) : null}
			{hasPrediction ? (
				<Link type="button" className="w-full block" to={`/race/${circuitCode}/prediction`}>
					<GlareHover glareColor="#d71414" className="bg-secondary/20" {...glareButtonProps}>
						<span className="flex items-center gap-2 font-kh">
							<PencilLineIcon className="w-4 h-4" />
							{isLocked ? "View Prediction" : "Edit Prediction"}
						</span>
					</GlareHover>
				</Link>
			) : (
				<EnterButton />
			)}
			{hasPrediction && (
				<Link
					type="button"
					className="w-full mt-3 block"
					to={isLocked ? `/race/${circuitCode}/league` : `/race/${circuitCode}/prediction`}
				>
					<GlareHover
						glareColor={isLocked ? "#6366f1" : "#f43f5e"}
						className="bg-secondary/20"
						{...glareButtonProps}
					>
						{isLocked ? (
							<span className="flex items-center gap-2 font-kh">
								<ListIcon className="w-4 h-4" />
								View League Predictions
							</span>
						) : (
							<span className="flex items-center gap-2 text-rose-400">
								<LockIcon className="w-3 h-3" />
								Lock prediction to view league
							</span>
						)}
					</GlareHover>
				</Link>
			)}
		</motion.div>
	);
};

function Schedule({ race }: { race: RaceModel }) {
	const sessions = race.getSessions();

	return (
		<motion.div
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.15, duration: 0.45 }}
			className="mt-4"
		>
			<H2>Schedule</H2>
			{sessions.length &&
				sessions.map((session) => <SessionRow session={session} key={session.session_key} />)}
		</motion.div>
	);
}

function dayOfWeek(date: Date): string {
	const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	return days[date.getDay()];
}

function SessionIcon({
	session_type,
	...props
}: { session_type: string } & React.SVGProps<SVGSVGElement>) {
	switch (session_type) {
		case "Race":
			return <TrophyIcon {...props} />;
		case "Practice":
			return <DumbbellIcon {...props} />;
		case "Qualifying":
			return <ClockIcon {...props} />;
		case "Sprint":
			return <TrophyIcon {...props} />;
		default:
			return <ClockIcon {...props} />;
	}
}

const SessionRow: React.FC<{ session: Session }> = ({ session }) => {
	const start = new Date(session.date_start);
	const isPast = new Date(session.date_end) < new Date();
	const isOngoing = start < new Date() && new Date(session.date_end) > new Date();
	return (
		<Dialog>
			<DialogTrigger asChild>
				<div
					className={cn("px-4 py-1 border border-border my-2 rounded-md", {
						"text-muted-foreground": isPast && !isOngoing,
						"text-accent-foreground animate-pulse": isOngoing,
					})}
				>
					<div className="flex flex-row items-center">
						<p className="flex items-center gap-2 flex-grow text-2xl">
							<SessionIcon className="size-5" session_type={session.session_type} />
							{session.session_name}
						</p>
						<div className="text-right font-kh">
							<p>
								{dayOfWeek(start)}{" "}
								{start.toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								})}
							</p>
							<p>{new Date(session.date_start).toLocaleTimeString("en-US")}</p>
						</div>
					</div>
				</div>
			</DialogTrigger>
			<DialogContent className="md:max-w-[calc(100%-6rem)] xl:max-w-7xl">
				<SessionResults session={session} />
			</DialogContent>
		</Dialog>
	);
};

function formatGap(position: number | null, gap: number | string | null): string {
	if (position === 1) return "Leader";
	if (typeof gap === "string") return gap;
	if (gap === null) return "";
	const minutes = Math.floor(gap / 60);
	const seconds = gap % 60;
	if (minutes > 0) return `+${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
	return `+${seconds.toFixed(3)}s`;
}

export function SessionResults({ session }: { session: Session }) {
	const isLg = useMediaQuery("(min-width: 1024px)");
	const cols = isLg ? 3 : 2;
	const {
		data: results,
		error,
		isLoading,
	} = useApi<SessionResult[]>("https://api.openf1.org/v1/session_result", {
		params: {
			session_key: session.session_key,
		},
	});

	const isPast = new Date(session.date_end) < new Date();

	if (!isPast) {
		return (
			<article className="p-4 text-muted-foreground text-sm">
				Results will be available after the session ends.
			</article>
		);
	}

	if (isLoading || !results) {
		return (
			<div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-y-auto max-h-[calc(100vh-10rem)]">
				{SKELETON_KEYS.map((key) => (
					<Skeleton key={key} className="w-30 h-40 lg:w-40 lg:h-48" />
				))}
			</div>
		);
	}
	if (error) {
		return <div className="text-red-500">{error.message}</div>;
	}

	const sorted = [...results].sort((a, b) => {
		if (!a.position || !b.position) return a.points - b.points;
		return a.position - b.position;
	});

	return (
		<div className="overflow-y-auto no-scrollbar max-h-[calc(100vh-10rem)]">
			<h2 className="text-3xl font-semibold mb-3 font-audiowide px-4 text-center uppercase">
				{session.circuit_code} {session.session_name} Results
			</h2>
			<div className="px-4 pt-8 grid grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-12 mx-auto max-w-5xl">
				{sorted.map((result, i) => {
					const driver = DRIVERS.find((d) => d.number === result.driver_number);
					const status = result.dnf ? "DNF" : result.dns ? "DNS" : result.dsq ? "DSQ" : null;
					return (
						<motion.div
							initial={{ opacity: 0, x: -5, y: 10 * (i % cols) }}
							animate={{ opacity: 1, x: 0, y: 14 * (i % cols) }}
							transition={{
								delay: 0.03 * (i + (i % cols)),
								duration: 0.2,
								type: "spring",
								stiffness: 200,
								damping: 25,
							}}
							key={result.driver_number}
							className={`flex flex-row items-center gap-3`}
						>
							{driver ? (
								<>
									<DriverCardCompact
										driver={driver}
										className="block md:hidden w-30 h-40 rounded-lg shrink-0"
									/>
									<DriverCardFull
										driver={driver}
										className="hidden md:block w-48 h-36 rounded-md shrink-0"
									/>
								</>
							) : (
								<div className="h-28 rounded-md flex-shrink-0 bg-secondary/40 flex items-center justify-center text-xs text-muted-foreground">
									#{result.driver_number}
								</div>
							)}
							<div className="flex flex-col gap-0.5">
								<span className="font-kh text-xl lg:text-3xl font-bold">
									{status ?? (result.position ? `P${result.position}` : "—")}
								</span>
								<span className="text-sm text-muted-foreground font-kh">
									{formatGap(result.position, result.gap_to_leader)}
								</span>
								{result.points > 0 && (
									<span className="text-sm font-kh text-amber-400">{result.points} pts</span>
								)}
							</div>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}
