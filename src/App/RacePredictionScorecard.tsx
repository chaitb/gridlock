import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { Spinner } from "@/components/ui/spinner";
import { RACES_2026 } from "@/data";
import type { ApiError } from "@/helpers/useApi";
import { useApi } from "@/helpers/useApi";
import { useMediaQuery } from "@/helpers/useMediaQuery";
import { safeJsonParse } from "@/lib/utils";
import type { PredictionContent, UserRaceScore } from "@/shared/model";
import { AppLayout } from "./Layout";
import { Scorecard } from "./Scorecard";

type LeaguePrediction = {
	id: number;
	user_id: number;
	circuit_code: string;
	prediction: string;
	created_at: string;
	updated_at: string;
	username: string;
};

type LeaguePredictionsResponse = {
	predictions: LeaguePrediction[];
};

type UserScoreResponse = UserRaceScore;

export function RacePredictionScorecard() {
	const params = useParams();
	const circuitCode = params.circuit_code;
	const username = params.username;
	const race = RACES_2026.find((r) => r.circuit_code === circuitCode);
	const isLarge = useMediaQuery(1024);

	const {
		data: predResult,
		isLoading: predLoading,
		error: predError,
	} = useApi<LeaguePredictionsResponse>("/api/league-predictions", {
		params: { circuitCode: circuitCode ?? "", username: username ?? "" },
	});

	const { data: scoreData, isLoading: scoreLoading } = useApi<UserScoreResponse>(
		"/api/scores/user",
		{
			params: { username: username ?? "", circuitCode: circuitCode ?? "" },
		}
	);

	if (!race) {
		return (
			<AppLayout headline="Scorecard">
				<p className="text-muted-foreground">Race not found.</p>
			</AppLayout>
		);
	}

	if (predLoading || scoreLoading) {
		return (
			<AppLayout headline="Scorecard">
				<div className="flex items-center justify-center py-8">
					<Spinner />
				</div>
			</AppLayout>
		);
	}

	if (predError) {
		const apiError = predError as ApiError;
		return (
			<AppLayout headline="Scorecard">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="space-y-4"
				>
					<p className="text-destructive">Error: {apiError.message}</p>
				</motion.div>
			</AppLayout>
		);
	}

	const leaguePred = predResult?.predictions?.[0];
	if (!leaguePred?.prediction) {
		return (
			<AppLayout headline="Scorecard">
				<p className="text-muted-foreground">No prediction found for this user.</p>
			</AppLayout>
		);
	}

	const prediction = safeJsonParse<PredictionContent>(leaguePred.prediction);
	if (!prediction) {
		return (
			<AppLayout headline="Scorecard">
				<p className="text-muted-foreground">Invalid prediction data.</p>
			</AppLayout>
		);
	}

	if (!scoreData?.breakdown) {
		return (
			<AppLayout headline="Scorecard">
				<p className="text-muted-foreground">No score found for this user.</p>
			</AppLayout>
		);
	}

	return (
		<AppLayout headline="Scorecard" wide={isLarge}>
			<div className="mb-6 mx-3">
				<h2 className="text-xl font-medium">{race.name}</h2>
				<p className="text-sm text-muted-foreground">
					<Link
						to={`/${username}/predictions`}
						className="text-primary underline-offset-2 hover:underline"
					>
						@{username}
					</Link>{" "}
					&middot; {scoreData.score} pts
				</p>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="mx-3"
			>
				<Scorecard
					variant={isLarge ? "split" : "default"}
					userRaceScore={scoreData}
					prediction={prediction}
				/>
			</motion.div>
		</AppLayout>
	);
}
