import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RACES_2026 } from "@/data";
import type { ApiError } from "@/helpers/useApi";
import { useApi } from "@/helpers/useApi";
import { safeJsonParse } from "@/lib/utils";
import type { Prediction, PredictionContent } from "@/shared/model";
import { AppLayout } from "./Layout";
import { container, PredictionCard } from "./PredictionCard";
import { PredictionForm } from "./PredictionForm";

type PredictionsResponse = {
	predictions: Prediction[];
};

export function LeaguePredictions() {
	const params = useParams();
	const circuitCode = params.circuit_code;
	const race = RACES_2026.find((r) => r.circuit_code === circuitCode);
	const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const { data, isLoading, error } = useApi<PredictionsResponse>("/api/league-predictions", {
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

	const handleCardClick = (pred: Prediction) => {
		setSelectedPrediction(pred);
		setDialogOpen(true);
	};

	return (
		<AppLayout headline="League Predictions">
			<div className="mb-6 mx-3">
				<h2 className="text-xl font-medium">{race.name}</h2>
				<p className="text-sm text-muted-foreground">
					{predictions.length} player
					{predictions.length === 1 ? "" : "s"} submitted predictions
				</p>
			</div>

			{predictions.length === 0 ? (
				<p className="text-muted-foreground">No predictions submitted yet.</p>
			) : (
				<motion.ul
					variants={container}
					initial="hidden"
					animate="show"
					className="flex flex-col divide-y divide-border"
				>
					{predictions.map((pred) => {
						if (!pred.prediction) return null;
						const content = safeJsonParse<PredictionContent>(pred.prediction);
						if (!content) return null;

						const header = (
							<div className="flex items-center gap-3 mb-3">
								<span className="font-medium">@{pred.username}</span>
								<span className="text-xs text-muted-foreground ml-auto">
									{new Date(`${pred.updated_at.replace(" ", "T")}Z`).toLocaleDateString()}
								</span>
							</div>
						);

						return (
							<PredictionCard
								key={pred.id}
								header={header}
								content={content}
								score={pred.score}
								username={pred.username ?? "unknown"}
								circuitCode={circuitCode ?? ""}
								onClick={() => handleCardClick(pred)}
							/>
						);
					})}
				</motion.ul>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-h-[90vh] md:max-w-2xl overflow-y-auto ">
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
							{selectedPrediction.prediction && (
								<div className="mt-4 w-full">
									<PredictionForm
										predictions={
											safeJsonParse<PredictionContent>(selectedPrediction.prediction) ??
											({} as PredictionContent)
										}
										onChange={() => {}}
										readOnly
									/>
								</div>
							)}
						</>
					)}
				</DialogContent>
			</Dialog>
		</AppLayout>
	);
}
