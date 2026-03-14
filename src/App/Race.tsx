import { motion } from "framer-motion";
import {
	ClockIcon,
	DumbbellIcon,
	FlagIcon,
	ListIcon,
	LockIcon,
	PencilLineIcon,
	TrophyIcon,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { EnterButton } from "@/components/EnterButton";
import GlareHover from "@/components/GlareHover";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { RACES_2026 } from "@/data";
import { useApi } from "@/helpers/useApi";
import { cn } from "@/lib/utils";
import type { Prediction, Race, Session } from "@/shared/model";
import { AppLayout } from "./Layout";
import { RaceHeader } from "./RaceHeader";
import { SessionResults } from "./SessionResults";
import { H2 } from "./Text";

export function RaceComponent() {
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
				<Predictions race={race} />
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

const Predictions: React.FC<{ race: Race }> = ({ race }) => {
	const [, _navigate] = useLocation();
	const { data: pred, error } = useApi<Prediction>(`/api/predictions`, {
		params: { circuitCode: race.circuit_code },
	});

	const isClosed = !race.isOpenForPredictions();

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
				<Link type="button" className="w-full block" to={`/race/${race.circuit_code}/prediction`}>
					<GlareHover glareColor="#d71414" className="bg-secondary/20" {...glareButtonProps}>
						<span className="flex items-center gap-2 font-kh">
							<PencilLineIcon className="w-4 h-4" />
							{isLocked ? "View Prediction" : "Edit Prediction"}
						</span>
					</GlareHover>
				</Link>
			) : isClosed ? (
				<Alert>
					<AlertTitle>Sorry, predictions are closed!</AlertTitle>
				</Alert>
			) : (
				<EnterButton />
			)}
			{hasPrediction && (
				<Link
					type="button"
					className="w-full mt-3 block"
					to={
						isLocked ? `/race/${race.circuit_code}/league` : `/race/${race.circuit_code}/prediction`
					}
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

function Schedule({ race }: { race: Race }) {
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
	const [open, setOpen] = useState(false);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<div
					className={cn("px-4 py-1 border border-border my-2 rounded-md cursor-pointer", {
						"text-muted-foreground": isPast && !isOngoing,
						"text-accent-foreground animate-pulse": isOngoing,
					})}
				>
					<div className="flex flex-row items-center gap-4">
						<SessionIcon className="size-4" session_type={session.session_type} />
						<div className="grow text-2xl">{session.session_name}</div>
						{isPast && !isOngoing && <FlagIcon className="m-2 size-7 text-orange-400" />}
						<div className="text-right min-w-22 font-kh text-sm">
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
				<SessionResults session={session} onDriverClick={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
};
