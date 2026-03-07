import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { PredictionForm } from "./PredictionForm";
import { useApi } from "@/helpers/useApi";
import { AppLayout } from "./Layout";
import { RACES_2026 } from "@/data";
import { DRIVERS } from "./driver";
import type { ApiError } from "@/helpers/useApi";
import type { PredictionContent } from "@/model";
import { GAINER_KEYS, LOSER_KEYS, QUALIFYING_KEYS } from "./PredictionForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type LeaguePrediction = {
	id: number;
	user_id: number;
	race_code: string;
	prediction: string;
	created_at: string;
	updated_at: string;
	username: string;
};

type LeaguePredictionsResponse = {
	predictions: LeaguePrediction[];
};

const container = {
	hidden: {},
	show: { transition: { staggerChildren: 0.05 } },
};

const item = {
	hidden: { opacity: 0, y: 8 },
	show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function getDriverByAcronym(acronym: string | null) {
	if (!acronym) return null;
	return DRIVERS.find((d) => d.acronym === acronym);
}

function DriverPill({ acronym }: { acronym: string | null }) {
	const driver = getDriverByAcronym(acronym);
	if (!driver) {
		return <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">—</span>;
	}
	return (
		<span
			className="px-2 py-0.5 rounded text-xs font-medium text-white"
			style={{ backgroundColor: `#${driver.colour}` }}
		>
			{driver.acronym}
		</span>
	);
}

function PredictionSection({
	title,
	keys,
	prediction,
}: {
	title: string;
	keys: readonly string[];
	prediction: Record<string, string | null>;
}) {
	return (
		<div className="space-y-1">
			<p className="text-[10px] uppercase tracking-wider text-muted-foreground">{title}</p>
			<div className="flex flex-wrap gap-1">
				{keys.map((key) => (
					<DriverPill key={key} acronym={prediction[key]} />
				))}
			</div>
		</div>
	);
}

export function LeaguePredictions() {
	const params = useParams();
	const circuitCode = params.circuit_code;
	const race = RACES_2026.find((r) => r.circuit_code === circuitCode);
	const [selectedPrediction, setSelectedPrediction] = useState<LeaguePrediction | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const { data, isLoading, error } = useApi<LeaguePredictionsResponse>("/api/league-predictions", {
		params: { circuitCode: circuitCode ?? "" },
	});

	if (!race) {
		return (
			<AppLayout headline="League Predictions">
				<p className="text-muted-foreground">Race not found.</p>
			</AppLayout>
		);
	}

	if (isLoading) {
		return (
			<AppLayout headline="League Predictions">
				<p className="text-muted-foreground">Loading...</p>
			</AppLayout>
		);
	}

	if (error) {
		const apiError = error as ApiError;
		const code = (apiError.body as { code?: string })?.code;

		if (code === "PREDICTION_REQUIRED") {
			return (
				<AppLayout headline="League Predictions">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-4"
					>
						<p className="text-muted-foreground">{apiError.message}</p>
						<Link
							to={`/race/${circuitCode}/prediction`}
							className="inline-block text-accent-foreground underline underline-offset-2 hover:no-underline"
						>
							Submit your predictions →
						</Link>
					</motion.div>
				</AppLayout>
			);
		}

		if (code === "PREDICTION_INCOMPLETE") {
			return (
				<AppLayout headline="League Predictions">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-4"
					>
						<p className="text-muted-foreground">{apiError.message}</p>
						<Link
							to={`/race/${circuitCode}/prediction`}
							className="inline-block text-accent-foreground underline underline-offset-2 hover:no-underline"
						>
							Complete your predictions →
						</Link>
					</motion.div>
				</AppLayout>
			);
		}

		return (
			<AppLayout headline="League Predictions">
				<p className="text-destructive">Error: {apiError.message}</p>
			</AppLayout>
		);
	}

	const predictions = data?.predictions ?? [];

	const handleCardClick = (pred: LeaguePrediction) => {
		setSelectedPrediction(pred);
		setDialogOpen(true);
	};

	return (
		<AppLayout headline="League Predictions">
			<div className="ml-4">
				<div className="mb-6">
					<h2 className="text-xl font-medium">{race.name}</h2>
					<p className="text-sm text-muted-foreground">
						{predictions.length} player
						{predictions.length === 1 ? "" : "s"} submitted predictions
					</p>
				</div>

				{predictions.length === 0 ? (
					<p className="text-muted-foreground">No predictions submitted yet.</p>
				) : (
					<motion.div
						variants={container}
						initial="hidden"
						animate="show"
						className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
					>
						{predictions.map((pred) => {
							let content: PredictionContent | null = null;
							try {
								content = JSON.parse(pred.prediction ?? "{}") as PredictionContent;
							} catch {
								return null;
							}

							return (
								<motion.button
									key={pred.id}
									variants={item}
									type="button"
									onClick={() => handleCardClick(pred)}
									className="text-left p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
								>
									<div className="flex items-center justify-between mb-3">
										<span className="font-medium text-lg">{pred.username}</span>
									</div>
									<div className="grid gap-3">
										<PredictionSection
											title="Qualifying"
											keys={QUALIFYING_KEYS}
											prediction={content.qualifying}
										/>
										<PredictionSection
											title="Race"
											keys={QUALIFYING_KEYS}
											prediction={content.race}
										/>
										<PredictionSection
											title="Gainers"
											keys={GAINER_KEYS}
											prediction={content.gainers}
										/>
										<PredictionSection
											title="Losers"
											keys={LOSER_KEYS}
											prediction={content.losers}
										/>
									</div>
								</motion.button>
							);
						})}
					</motion.div>
				)}
			</div>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
					{selectedPrediction && (
						<>
							<DialogHeader>
								<DialogTitle>
									<Link
										to={`/${selectedPrediction.username}/predictions`}
										className="text-primary underline-offset-2 hover:underline"
									>
										@{selectedPrediction.username}'s
									</Link>{" "}
									Prediction
								</DialogTitle>
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
