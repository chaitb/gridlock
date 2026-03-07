import { motion } from "framer-motion";
import type React from "react";
import { Link, useLocation, useParams } from "wouter";
import { EnterButton } from "@/components/EnterButton";
import { cn } from "@/lib/utils";
import type { Prediction, CircuitCode, Session } from "@/model";
import { H2 } from "./Text";
import { RaceHeader } from "./RaceHeader";
import { AppLayout } from "./Layout";
import { RACES_2026 } from "@/data";
import { useApi } from "@/helpers/useApi";
import GlareHover from "@/components/GlareHover";
import {
	ClockIcon,
	DumbbellIcon,
	ListIcon,
	LockIcon,
	PencilLineIcon,
	TrophyIcon,
} from "lucide-react";
import { SESSIONS } from "@/data";

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
			<RaceHeader race={race} />
			<div className="mt-8 px-4 md:px-10">
				<Predictions circuitCode={race.circuit_code} />
			</div>
			<div className="mt-8 px-4 md:px-10 mb-20">
				<Schedule circuitCode={race.circuit_code} />
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
	const [, navigate] = useLocation();
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
				<button
					type="button"
					className="w-full"
					onClick={() => navigate(`/race/${circuitCode}/prediction`)}
				>
					<GlareHover glareColor="#d71414" className="bg-secondary/20" {...glareButtonProps}>
						<span className="flex items-center gap-2 font-kh">
							<PencilLineIcon className="w-4 h-4" />
							{isLocked ? "View Prediction" : "Edit Prediction"}
						</span>
					</GlareHover>
				</button>
			) : (
				<EnterButton />
			)}
			{hasPrediction && (
				<button
					type="button"
					className="w-full mt-3"
					onClick={() => isLocked && navigate(`/race/${circuitCode}/league`)}
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
				</button>
			)}
		</motion.div>
	);
};

function Schedule({ circuitCode }: { circuitCode: CircuitCode }) {
	const sessions = SESSIONS.filter((s) => s.circuit_code === circuitCode);

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
	);
};
