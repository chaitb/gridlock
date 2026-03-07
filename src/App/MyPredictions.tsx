import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { PencilLineIcon } from "lucide-react";
import { Flag } from "@/components/flags";
import { useApi } from "@/helpers/useApi";
import { useUser } from "@/context/useUser";
import { AppLayout } from "./Layout";
import { RACES_2026 } from "@/data";
import { BGButton } from "@/components/BGButton";
import { PredictionForm } from "./PredictionForm";
import type { CountryCode, Prediction, PredictionContent } from "@/model";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { container, item, PredictionCardContent } from "./PredictionCard";

type UserPredictionsResponse = {
	predictions: Prediction[];
	isOwner: boolean;
	unavailableRaces?: string[];
	code?: string;
	message?: string;
};

function PredictionCard({
	race,
	pred,
	content,
	updated,
	isOwner,
	onViewClick,
}: {
	race: (typeof RACES_2026)[number];
	pred: Prediction;
	content: PredictionContent;
	updated: Date | null;
	isOwner: boolean;
	onViewClick: (pred: Prediction) => void;
}) {
	const [, navigate] = useLocation();

	const inner = (
		<>
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
			<PredictionCardContent content={content} />
		</>
	);

	if (isOwner) {
		return (
			<motion.li key={race.circuit_code} variants={item}>
				<button
					type="button"
					className="block w-full text-left p-4 hover:bg-secondary transition-colors"
					onClick={() => navigate(`/race/${race.circuit_code}/prediction`)}
				>
					{inner}
				</button>
			</motion.li>
		);
	}

	return (
		<motion.li key={race.circuit_code} variants={item}>
			<button
				type="button"
				className="block w-full text-left p-4 hover:bg-secondary transition-colors"
				onClick={() => onViewClick(pred)}
			>
				{inner}
			</button>
		</motion.li>
	);
}

export function UserPredictions() {
	const params = useParams();
	const { user } = useUser();
	const username = params.username;
	const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const { data, isLoading, error } = useApi<UserPredictionsResponse>("/api/user-predictions", {
		params: {
			username: username ?? "",
			requestingUser: user?.username ?? "",
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

	const predictions = data?.predictions ?? [];
	const isOwner = data?.isOwner ?? false;
	const unavailableRaces = data?.unavailableRaces ?? [];
	const predictionsByRace = new Map<string, Prediction>();
	for (const pred of predictions) {
		predictionsByRace.set(pred.circuit_code, pred);
	}

	const headline = isOwner ? "My Predictions" : `${username}'s Predictions`;

	const handleViewClick = (pred: Prediction) => {
		setSelectedPrediction(pred);
		setDialogOpen(true);
	};

	return (
		<AppLayout headline={headline}>
			{predictions.length === 0 && unavailableRaces.length === 0 ? (
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
			) : (
				<>
					{unavailableRaces.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="mb-6 p-4 rounded-lg border border-border bg-card"
						>
							<p className="text-sm text-muted-foreground mb-3">
								Submit your predictions to view {username}'s picks for these races:
							</p>
							<div className="flex flex-wrap gap-2">
								{unavailableRaces.map((circuitCode) => {
									const race = RACES_2026.find((r) => r.circuit_code === circuitCode);
									if (!race) return null;
									return (
										<Link key={circuitCode} to={`/race/${circuitCode}/prediction`}>
											<BGButton className="h-12 px-4">
												<PencilLineIcon className="w-4 h-4 inline-block mr-2" />
												{race.name}
											</BGButton>
										</Link>
									);
								})}
							</div>
						</motion.div>
					)}

					<motion.ul
						variants={container}
						initial="hidden"
						animate="show"
						className="flex flex-col divide-y divide-border"
					>
						{RACES_2026.map((race) => {
							const pred = predictionsByRace.get(race.circuit_code);
							if (!pred) return null;

							let content: PredictionContent | null = null;
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
									pred={pred}
									content={content}
									updated={updated}
									isOwner={isOwner}
									onViewClick={handleViewClick}
								/>
							);
						})}
					</motion.ul>
				</>
			)}

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
