import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { RACES_2026 } from "@/data";
import { useApi } from "@/helpers/useApi";
import type { Prediction, PredictionContent, UserRaceScore } from "@/shared/model";
import { Scorecard } from "../Scorecard";

type Status = { ok: boolean; message: string } | null;

type ScoreResponse = { scored: number; results: UserRaceScore[] };

type PredAndScore = {
	score: UserRaceScore;
	pred: PredictionContent;
};

export const ScoreRace = () => {
	const [circuitCode, setCircuitCode] = useState<string>("");
	const [scoreLoading, setScoreLoading] = useState(false);
	const [scoreStatus, setScoreStatus] = useState<Status>(null);
	const [scoreResults, setScoreResults] = useState<UserRaceScore[]>([]);
	const [selectedResult, setSelectedResult] = useState<PredAndScore | null>(null);
	const [_, navigate] = useLocation();

	const { data: predResult, error } = useApi<{ predictions: Prediction[] }>(
		`/api/league-predictions`,
		{
			params: { circuitCode },
			enabled: Boolean(circuitCode),
		}
	);

	useEffect(() => {
		if (!circuitCode) {
			setScoreResults([]);
			return;
		}

		const loadScoredResults = async () => {
			const res = await fetch(`/api/scores?circuitCode=${circuitCode}`);
			if (!res.ok) return;
			const body = (await res.json()) as UserRaceScore[];
			setScoreResults(body ?? []);
		};

		loadScoredResults();
	}, [circuitCode]);

	async function handleScore() {
		if (!circuitCode) return;
		setScoreLoading(true);
		setScoreStatus(null);
		try {
			const res = await fetch("/api/admin/score", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ circuitCode }),
			});
			const body = (await res.json()) as ScoreResponse & { message?: string };
			if (!res.ok) {
				setScoreStatus({ ok: false, message: body.message ?? "Failed to score race" });
				return;
			}
			setScoreStatus({ ok: true, message: `Scored ${body.scored} predictions` });
			setScoreResults(body.results ?? []);
		} catch (err) {
			setScoreStatus({
				ok: false,
				message: err instanceof Error ? err.message : "Unknown error",
			});
		} finally {
			setScoreLoading(false);
		}
	}

	function openScorecard(result: UserRaceScore) {
		const pred = predResult?.predictions.find((p) => p.user_id === result.userId);
		if (!pred?.prediction) return;
		const predContent: PredictionContent = JSON.parse(pred.prediction);
		setSelectedResult({ score: result, pred: predContent });
	}

	function goToResult(result: UserRaceScore) {
		navigate(`/race/${result.circuitCode}/league/${result.username}`);
	}

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	return (
		<div className="space-y-3">
			<p className="text-sm text-muted-foreground">
				Select a race and run scoring against locked predictions. Click a row to inspect the
				breakdown.
			</p>
			<div className="flex items-center gap-3">
				<Select value={circuitCode} onValueChange={setCircuitCode}>
					<SelectTrigger className="w-64">
						<SelectValue placeholder="Select a race" />
					</SelectTrigger>
					<SelectContent>
						{RACES_2026.map((race) => (
							<SelectItem key={race.circuit_code} value={race.circuit_code}>
								R{race.round} — {race.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button
					variant="outline"
					size="sm"
					disabled={!circuitCode || scoreLoading}
					onClick={handleScore}
				>
					{scoreLoading ? "Scoring..." : "Score"}
				</Button>
			</div>
			{scoreStatus && (
				<p className={`text-xs ${scoreStatus.ok ? "text-green-400" : "text-red-400"}`}>
					{scoreStatus.message}
				</p>
			)}
			{scoreResults.length > 0 && (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>User ID</TableHead>
							<TableHead>Username</TableHead>
							<TableHead className="text-right">Score</TableHead>
							<TableHead className="text-right">Exact Matches</TableHead>
							<TableHead className="text-right">Link</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{scoreResults.map((r) => (
							<TableRow
								key={r.userId}
								className="cursor-pointer hover:bg-muted/50"
								onClick={() => openScorecard(r)}
							>
								<TableCell>{r.userId}</TableCell>
								<TableCell>{r.username}</TableCell>
								<TableCell className="text-right font-medium">{r.score}</TableCell>
								<TableCell className="text-right">{r.exactMatches}</TableCell>
								<TableCell className="text-right" onClick={() => goToResult(r)}>
									<ArrowUpRight className="size-4 ml-auto" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}

			<Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
				<DialogContent className="lg:max-w-screen-lg overflow-y-auto max-h-[90vh]">
					<DialogHeader>
						<DialogTitle>{selectedResult?.score.username}'s Scorecard</DialogTitle>
						<DialogDescription>
							Score: {selectedResult?.score.score} pts — {selectedResult?.score.exactMatches} exact
							matches
						</DialogDescription>
					</DialogHeader>
					{selectedResult && (
						<Scorecard userRaceScore={selectedResult.score} prediction={selectedResult.pred} />
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};
