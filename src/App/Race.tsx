import { motion } from "framer-motion";
import type React from "react";
import { Link, useLocation, useParams } from "wouter";
import { EnterButton } from "@/components/EnterButton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Prediction } from "@/model";
import { H2 } from "./Text";
import { RaceHeader } from "./RaceHeader";
import { POSTERS } from "./images/posters";
import { AppLayout } from "./Layout";
import { RACES_2026, type RaceCode } from "./RaceWeekend";
import { type ApiError, useApi } from "@/helpers/useApi";
import { BGButton } from "@/components/BGButton";
import { PencilLineIcon } from "lucide-react";
import { useCallback } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Session = {
	session_key: number;
	session_type: string;
	session_name: string;
	date_start: string;
	date_end: string;
	meeting_key: number;
	circuit_key: number;
	circuit_short_name: string;
	country_key: number;
	country_code: string;
	country_name: string;
	location: string;
	gmt_offset: string;
	year: number;
};

export function Race() {
	const params = useParams();
	const code = params.code;
	const race = RACES_2026.find((r) => r.code === code);

	if (!race) {
		return (
			<AppLayout>
				<p className="mt-8 text-sm text-muted-foreground">
					<Link to="/race" className="hover:underline">
						Race Calendar
					</Link>
					{" / "}Not found
				</p>
				<h1 className="mt-2 text-3xl font-medium tracking-tight">
					Race not found
				</h1>
			</AppLayout>
		);
	}

	return (
		<>
			<RaceHeader
				poster={POSTERS[race.code]}
				name={race.name}
				country={race.country}
				round={race.round}
				venue={race.venue}
				date={race.date}
				raceCode={race.code}
			/>

			<div className="mt-8 px-4 md:px-10">
				<Schedule />
			</div>
			<div className="mt-8 px-4 md:px-10 mb-20">
				<Predictions raceCode={race.code} />
			</div>
		</>
	);
}

const Predictions: React.FC<{ raceCode: RaceCode }> = ({ raceCode }) => {
	const [, navigate] = useLocation();
	const { data: pred, error } = useApi<{ prediction: Prediction }>(
		`/api/predictions`,
		{
			params: { raceCode },
		},
	);
	return (
		<motion.div
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.15, duration: 0.45 }}
			className="mt-4"
		>
			<H2>Predictions</H2>
			{error ? JSON.stringify(error) : null}
			{pred?.prediction ? (
				<BGButton
					onClick={() => navigate(`/race/${raceCode}/prediction`)}
					className="w-full"
				>
					<PencilLineIcon className="w-4 h-4 inline-block mr-2" />
					Edit Prediction
				</BGButton>
			) : (
				<EnterButton />
			)}
		</motion.div>
	);
};

function Schedule() {
	const {
		data: sessions,
		isLoading,
		error,
	} = useApi<Session[]>("https://api.openf1.org/v1/sessions", {
		params: {
			country_name: "Australia",
			year: 2026,
		},
	});

	const isLiveError = useCallback((error: ApiError) => {
		const body = error.getBody() as unknown as any;
		if (error.status === 401) {
			try {
				if (body?.detail?.includes("Live")) {
					return true;
				}
			} catch {
				return false;
			}
		}
		return false;
	}, []);

	return (
		<motion.div
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.15, duration: 0.45 }}
			className="mt-4"
		>
			<H2>Schedule</H2>
			{isLoading && (
				<>
					<Skeleton className="h-13 w-full my-2" />
					<Skeleton className="h-13 w-full my-2" />
					<Skeleton className="h-13 w-full my-2" />
					<Skeleton className="h-13 w-full my-2" />
					<Skeleton className="h-13 w-full my-2" />
				</>
			)}
			{error ? (
				isLiveError(error) ? (
					<Alert variant="default">
						<AlertTitle className="flex items-center text-xl">
							Live event in progress
							<span className="bg-accent-foreground animate-pulse rounded-full size-4 inline-block ml-2"></span>
						</AlertTitle>
						<AlertDescription>
							Check back later for the latest updates.
						</AlertDescription>
					</Alert>
				) : (
					error.message
				)
			) : null}
			{!error &&
				sessions &&
				sessions.length > 0 &&
				sessions.map((session) => (
					<Session session={session} key={session.session_key} />
				))}
		</motion.div>
	);
}

function dayOfWeek(date: Date): string {
	const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	return days[date.getDay()];
}

const Session: React.FC<{ session: Session }> = ({ session }) => {
	const start = new Date(session.date_start);
	const isPast = new Date(session.date_end) < new Date();
	const isOngoing =
		start < new Date() && new Date(session.date_end) > new Date();
	return (
		<div
			className={cn("px-4 py-1 border border-border my-2 rounded-md", {
				"text-muted-foreground": isPast && !isOngoing,
				"text-accent-foreground animate-pulse": isOngoing,
			})}
		>
			<div className="flex flex-row items-center">
				<p className={cn("flex-grow text-2xl")}>
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
					<p>
						{new Date(session.date_start).toLocaleTimeString(
							"en-US",
						)}
					</p>
				</div>
			</div>
		</div>
	);
};
