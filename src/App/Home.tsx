import { motion } from "framer-motion";
import { Link } from "wouter";
import { AppLayout } from "./Layout";
import { useUser } from "@/context/useUser";
import { useMemo } from "react";
import { RACES_2026 } from "@/data";
import { useApi } from "@/helpers/useApi";
import type { Prediction, Race } from "@/model";
import { Flag } from "@/components/flags";
import type { CountryCode } from "@/model";
import { cn } from "@/lib/utils";

type UserPredictionsResponse = {
	predictions: Prediction[];
	isOwner: boolean;
};

function RaceCard({
	className,
	race,
	label,
	subtitle,
	to,
}: {
	className?: string;
	race: Race;
	label: string;
	subtitle?: string;
	to: string;
}) {
	return (
		<Link
			to={to}
			className={cn(
				"p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors",
				className
			)}
		>
			<p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
			<div className="flex items-center gap-3">
				<Flag className="size-8 rounded shadow-sm" countryCode={race.country as CountryCode} />
				<div>
					<p className="font-medium text-lg">{race.name}</p>
					{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
				</div>
			</div>
		</Link>
	);
}

export function UserHome() {
	const { user } = useUser();

	const { data: predictionsData } = useApi<UserPredictionsResponse>("/api/user-predictions", {
		params: {
			username: user?.username ?? "",
			requestingUser: user?.username ?? "",
		},
	});

	const { now, sixDaysFromNow } = useMemo(() => {
		const now = new Date();
		now.setHours(0, 0, 0, 0);
		const sixDaysFromNow = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
		return { now, sixDaysFromNow };
	}, []);

	const upcomingRace = useMemo(() => {
		return RACES_2026.find((race) => race.date >= now && race.date <= sixDaysFromNow);
	}, [now, sixDaysFromNow]);

	const incompletePrediction = (() => {
		if (!predictionsData?.predictions) return null;
		const predictions = predictionsData.predictions;
		const predictionByCircuit = new Map<string, Prediction>();
		for (const pred of predictions) {
			predictionByCircuit.set(pred.circuit_code, pred);
		}
		const upcoming = RACES_2026.filter((race) => race.date >= now);
		for (const race of upcoming) {
			const pred = predictionByCircuit.get(race.circuit_code);
			if (!pred || pred.locked !== 1) {
				return { race, pred };
			}
		}
		return null;
	})();

	const LINKS = useMemo(
		() => [
			{
				title: "Races",
				path: "/race",
			},
			{
				title: "2026 Season Predictions",
				path: "/season",
			},
			{
				title: "Rules",
				path: "/rules",
			},
			{
				title: "Leaderboard",
				path: "/leaderboard",
			},
			{
				title: "My Predictions",
				path: user?.username ? `/${user.username}/predictions` : "/my-predictions",
			},
			{
				title: user?.username ? (
					<p className="text-primary group-hover:text-accent-foreground transition-colors duration-300">
						<span className="text-md text-muted-foreground/60 group-hover:text-accent-foreground transition-colors duration-300">
							@
						</span>
						{user.username}
					</p>
				) : (
					"Profile"
				),
				path: "/profile",
			},
		],
		[user]
	);

	const showCards = upcomingRace || incompletePrediction;

	return (
		<AppLayout headline="GridLock">
			{showCards && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="mb-6 px-3 flex flex-wrap gap-4 w-full"
				>
					{upcomingRace && (
						<RaceCard
							className="flex-1"
							race={upcomingRace}
							label="Upcoming Race"
							subtitle={upcomingRace.date.toLocaleDateString("en-US", {
								weekday: "short",
								month: "short",
								day: "numeric",
							})}
							to={`/race/${upcomingRace.circuit_code}`}
						/>
					)}

					{incompletePrediction && (
						<RaceCard
							className="flex-1"
							race={incompletePrediction.race}
							label="Complete Your Prediction"
							subtitle={
								incompletePrediction.pred
									? incompletePrediction.pred.locked === 1
										? "Locked"
										: "In progress"
									: "Not started"
							}
							to={`/race/${incompletePrediction.race.circuit_code}/prediction`}
						/>
					)}
				</motion.div>
			)}

			{LINKS.map((l, i) => (
				<motion.div
					key={l.path}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: i * 0.12 }}
					className="mb-2"
				>
					<Link to={l.path}>
						<h1 className="ml-3 mt-2 scroll-m-20 text-left text-4xl font-medium tracking-tight text-balance hover:text-accent-foreground transition-colors duration-300 group">
							{l.title}
						</h1>
					</Link>
				</motion.div>
			))}
		</AppLayout>
	);
}
