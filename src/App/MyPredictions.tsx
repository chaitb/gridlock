import { motion } from "framer-motion";
import { LockIcon } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { Flag } from "@/components/flags";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUser } from "@/context/useUser";
import { RACES_2026 } from "@/data";
import { useApi } from "@/helpers/useApi";
import type { CountryCode, Prediction, PredictionContent } from "@/shared/model";
import { AppLayout } from "./Layout";
import { container, item, PredictionCardContent } from "./PredictionCard";
import { PredictionForm } from "./PredictionForm";

type UserPredictionsResponse = {
	predictions: Prediction[];
	isOwner: boolean;
	unavailableRaces?: string[];
	code?: string;
	message?: string;
};

function PredictionCardHeader({
	race,
	updated,
}: {
	race: (typeof RACES_2026)[number];
	updated: Date | null;
}) {
	return (
		<div className="flex items-center gap-3 mb-3">
			<Flag
				className="size-4 object-cover rounded-full shadow-sm"
				countryCode={race.country as CountryCode}
			/>
			<span className="font-medium">{race.name}</span>
			{updated && (
				<span className="text-xs text-muted-foreground ml-auto">
					{updated.toLocaleDateString()}
				</span>
			)}
		</div>
	);
}

function PredictionCard({
	race,
	content,
	updated,
	isOwner,
	onViewClick,
	children,
}: {
	race: (typeof RACES_2026)[number];
	content: PredictionContent | null;
	updated: Date | null;
	isOwner: boolean;
	onViewClick: () => void;
	children?: React.ReactNode;
}) {
	const [, navigate] = useLocation();

	if (isOwner) {
		return (
			<motion.li key={race.circuit_code} variants={item}>
				<button
					type="button"
					className="block w-full text-left p-4 hover:bg-secondary transition-colors"
					onClick={() => navigate(`/race/${race.circuit_code}/prediction`)}
				>
					<PredictionCardHeader race={race} updated={updated} />
					{content && <PredictionCardContent content={content} />}
					{children}
				</button>
			</motion.li>
		);
	}

	return (
		<motion.li key={race.circuit_code} variants={item}>
			<button
				type="button"
				className="block w-full text-left p-4 hover:bg-secondary transition-colors"
				onClick={onViewClick}
			>
				<PredictionCardHeader race={race} updated={updated} />
				{content && <PredictionCardContent content={content} />}
				{children}
			</button>
		</motion.li>
	);
}

export function UserPredictions() {
	const params = useParams();
	const { user } = useUser();
	const [, navigate] = useLocation();
	const username = params.username;
	const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const {
		data: theirPredictionsResponse,
		isLoading,
		error,
	} = useApi<UserPredictionsResponse>("/api/user-predictions", {
		params: {
			username: username ?? "",
		},
	});

	if (!user) {
		return (
			<AppLayout headline="Predictions">
				<p className="text-muted-foreground">Please log in to view predictions.</p>
			</AppLayout>
		);
	}

	if (isLoading) {
		return (
			<AppLayout headline="Predictions">
				<p className="text-muted-foreground">Loading...</p>
			</AppLayout>
		);
	}

	if (error) {
		return (
			<AppLayout headline="Predictions">
				<p className="text-destructive">Error: {error.message}</p>
			</AppLayout>
		);
	}

	const theirPreds = theirPredictionsResponse?.predictions ?? [];
	const isOwner = theirPredictionsResponse?.isOwner ?? false;
	const unavailableRaces = theirPredictionsResponse?.unavailableRaces ?? [];
	const theirPredsByRace = new Map<string, Prediction>();
	for (const pred of theirPreds) {
		theirPredsByRace.set(pred.circuit_code, pred);
	}

	const headline = isOwner ? "My Predictions" : `${username}'s Predictions`;

	const handleViewClick = (pred: Prediction) => {
		setSelectedPrediction(pred);
		setDialogOpen(true);
	};

	return (
		<AppLayout headline={headline}>
			{theirPreds.length === 0 && unavailableRaces.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="space-y-4"
				>
					<p className="text-muted-foreground">
						{isOwner ? "You haven't" : `${username} hasn't`} made any predictions yet.
					</p>
					{isOwner && (
						<Link
							to="/race"
							className="inline-block text-accent-foreground underline underline-offset-2 hover:no-underline"
						>
							Browse races →
						</Link>
					)}
				</motion.div>
			) : null}
			{/*
				// 	{unavailableRaces.length > 0 && (
				// 		<motion.div
				// 			initial={{ opacity: 0, y: 10 }}
				// 			animate={{ opacity: 1, y: 0 }}
				// 			className="mb-6 p-4 rounded-lg border border-border bg-card"
				// 		>
				// 			<p className="text-sm text-muted-foreground mb-3">
				// 				Submit your predictions to view {username}'s picks for these races:
				// 			</p>
				// 			<div className="flex flex-wrap gap-2">
				// 				{unavailableRaces.map((circuitCode) => {
				// 					const race = RACES_2026.find((r) => r.circuit_code === circuitCode);
				// 					if (!race) return null;
				// 					return (
				// 						<Link key={circuitCode} to={`/race/${circuitCode}/prediction`}>
				// 							<BGButton className="h-12 px-4">
				// 								<PencilLineIcon className="w-4 h-4 inline-block mr-2" />
				// 								{race.name}
				// 							</BGButton>
				// 						</Link>
				// 					);
				// 				})}
				// 			</div>
				// 		</motion.div>
				// 	)}
 */}

			<motion.ul
				variants={container}
				initial="hidden"
				animate="show"
				className="flex flex-col divide-y divide-border"
			>
				{RACES_2026.map((race) => {
					const pred = theirPredsByRace.get(race.circuit_code);
					let content: PredictionContent | null = null;
					if (unavailableRaces.includes(race.circuit_code)) {
						return (
							<PredictionCard
								content={null}
								updated={null}
								key={race.circuit_code}
								race={race}
								isOwner={isOwner}
								onViewClick={() => navigate(`/race/${race.circuit_code}/prediction`)}
							>
								<div className="border-2 border-dashed border-destructive/30 rounded-md p-4 flex justify-center text-center items-center gap-2 mx-auto text-sm text-muted-foreground">
									<LockIcon className="w-4 h-4 inline-block" />
									Submit your prediction to view {username}'s picks for this race
								</div>
							</PredictionCard>
						);
					} else if (!pred) {
						return null;
					} else {
						try {
							content = JSON.parse(pred.prediction ?? "{}") as PredictionContent;
						} catch {
							return null;
						}

						const updated = pred.updated_at
							? new Date(`${pred.updated_at.replace(" ", "T")}Z`)
							: null;

						return (
							<PredictionCard
								key={race.circuit_code}
								race={race}
								content={content}
								updated={updated}
								isOwner={isOwner}
								onViewClick={() => handleViewClick(pred)}
							/>
						);
					}
				})}
			</motion.ul>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
					{selectedPrediction && (
						<>
							<DialogHeader>
								<DialogTitle>{username}'s Prediction</DialogTitle>
							</DialogHeader>
							<div className="mt-4">
								<PredictionForm
									predictions={
										JSON.parse(selectedPrediction.prediction ?? "{}") as PredictionContent
									}
									onChange={() => {}}
									readOnly
								/>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</AppLayout>
	);
}
