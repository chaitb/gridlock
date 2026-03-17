import { motion } from "framer-motion";
import { useMemo } from "react";
import { Link } from "wouter";
import { Flag } from "@/components/flags";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/useUser";
import { RACES_2026 } from "@/data";
import { useApi } from "@/helpers/useApi";
import { cn } from "@/lib/utils";
import type { CountryCode, Prediction, Race } from "@/shared/model";
import { AppLayout } from "./Layout";

type UserPredictionsResponse = {
	predictions: Prediction[];
	isOwner: boolean;
};

export type RaceCardProps = {
	className?: string;
	race: Race | undefined;
	label: string;
	subtitle?: string;
	to: string | undefined;
	loading?: boolean;
};

function RaceCard({ className, race, label, subtitle, to, loading }: RaceCardProps) {
	if (loading) {
		return (
			<div className={cn("p-4 rounded-lg border border-border bg-card", className)}>
				<Skeleton className="h-4 w-1/2 mb-1.5" />
				<div className="flex items-center gap-3 ">
					<Skeleton className="size-8 rounded" />
					<div className="flex-1 py-1">
						<Skeleton className="h-5 w-2/3 mb-2" />
						<Skeleton className="h-3 w-1/3" />
					</div>
				</div>
			</div>
		);
	}
	return (
		<Link
			to={to || "/"}
			className={cn(
				"p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors",
				className
			)}
		>
			<p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
			<div className="flex items-center gap-3">
				<Flag className="size-8 rounded shadow-sm" countryCode={race?.country as CountryCode} />
				<div>
					<p className="font-medium text-lg">{race?.name}</p>
					{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
				</div>
			</div>
		</Link>
	);
}

export function UserHome() {
	const { user } = useUser();

	const { data: predictionsData, isLoading } = useApi<UserPredictionsResponse>(
		"/api/user-predictions",
		{
			params: {
				username: user?.username ?? "",
				requestingUser: user?.username ?? "",
			},
		}
	);

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

	return (
		<AppLayout headline="GridLock">
			{/*{isLoading && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="mb-6 px-3 w-full"
				>
					<RaceCard loading className="w-full" />
				</motion.div>
			)}*/}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.2, ease: "easeOut" }}
				className="mb-6 px-3 flex flex-wrap gap-4 w-full"
			>
				{upcomingRace && (
					<RaceCard
						className="flex-1"
						race={upcomingRace}
						label="Upcoming Race"
						loading={isLoading}
						subtitle={upcomingRace.date.toLocaleDateString("en-US", {
							weekday: "short",
							month: "short",
							day: "numeric",
						})}
						to={`/race/${upcomingRace.circuit_code}`}
					/>
				)}

				{(isLoading || incompletePrediction) && (
					<RaceCard
						className="flex-1"
						race={incompletePrediction?.race}
						label="Complete Your Prediction"
						loading={isLoading}
						subtitle={
							!isLoading && incompletePrediction
								? incompletePrediction.pred
									? incompletePrediction.pred.locked === 1
										? "Locked"
										: "In progress"
									: "Not started"
								: undefined
						}
						to={
							incompletePrediction
								? `/race/${incompletePrediction.race.circuit_code}/prediction`
								: undefined
						}
					/>
				)}
			</motion.div>

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
