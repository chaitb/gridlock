import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { LockIcon } from "lucide-react";
import { PredictionForm } from "./PredictionForm";
import { POSTERS } from "./images/posters";
import { RaceHeader } from "./RaceHeader";
import { RACES_2026 } from "@/data";
import { useUser } from "@/context/useUser";
import { useApi } from "@/helpers/useApi";
import type { Prediction, PredictionContent } from "@/model";
import { initialPredictions } from "@/model";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2Icon } from "lucide-react";
import GlareHover from "@/components/GlareHover";
import { Spinner } from "@/components/ui/spinner";

function getRelativeTime(date: Date): string {
	const minsAgo = Math.floor((Date.now() - date.getTime()) / 60_000);
	if (!Number.isFinite(minsAgo) || minsAgo < 1) return "just now";
	return `${minsAgo} min${minsAgo === 1 ? "" : "s"} ago`;
}

export function RacePrediction() {
	const params = useParams();
	const { user } = useUser();
	const circuitCode = params.circuit_code;
	const race = RACES_2026.find((r) => r.circuit_code === circuitCode);
	const [, navigate] = useLocation();
	const [saving, setSaving] = useState(false);
	const [locking, setLocking] = useState(false);
	const [saved_at, setSaved_at] = useState<Date | null>(null);
	const {
		data: savedPrediction,
		isLoading,
		error,
		refetch,
	} = useApi<Prediction>(`/api/predictions`, {
		params: { circuitCode: circuitCode ?? "" },
	});

	const [predictions, setPredictions] = useState<PredictionContent>(initialPredictions);

	useEffect(() => {
		if (!savedPrediction?.prediction) return;

		const parsed = JSON.parse(savedPrediction.prediction) as PredictionContent;

		if (savedPrediction.updated_at) {
			const iso = savedPrediction.updated_at.replace(" ", "T") + "Z";
			setSaved_at(new Date(iso));
		}

		setPredictions((prev) => {
			const same = JSON.stringify(prev) === JSON.stringify(parsed);
			return same ? prev : parsed;
		});
	}, [savedPrediction]);

	const savePredictions = useCallback(async () => {
		if (!user?.id || !circuitCode) {
			navigate("/");
			return;
		}

		const isComplete = Object.values(predictions).every((section) =>
			Object.values(section).every((driver) => driver !== null)
		);

		setSaving(true);
		const response = await fetch("/api/predictions", {
			method: "POST",
			body: JSON.stringify({
				userId: user.id,
				circuitCode,
				predictions,
				isComplete,
				created_at: savedPrediction?.created_at ?? new Date().toISOString(),
			}),
		});
		if (!response.ok) throw new Error("Failed to save predictions");
		setSaving(false);
		refetch();
	}, [user, circuitCode, predictions, navigate, savedPrediction?.created_at, refetch]);

	const lockPrediction = useCallback(async () => {
		if (!user?.id || !circuitCode) return;
		setLocking(true);
		const response = await fetch("/api/predictions/lock", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId: user.id, circuitCode }),
		});
		if (!response.ok) {
			const body = (await response.json()) as { message?: string };
			alert(body.message ?? "Failed to lock prediction");
		}
		setLocking(false);
		refetch();
	}, [user, circuitCode, refetch]);

	if (!race) return <div>Race not found</div>;
	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {JSON.stringify(error)}</div>;

	const isLocked = savedPrediction?.locked === 1;
	const isComplete = savedPrediction
		? (() => {
				try {
					const p = JSON.parse(savedPrediction.prediction ?? "{}") as { isComplete?: boolean };
					return p.isComplete === true;
				} catch {
					return false;
				}
			})()
		: false;

	return (
		<div className="min-h-screen mb-20">
			<RaceHeader
				poster={POSTERS[race.circuit_code]}
				name={race.name}
				country={race.country}
				round={race.round}
				venue={race.venue}
				date={race.date}
				circuitCode={race.circuit_code}
			/>

			<div className="mt-8 px-4 md:px-10 max-w-4xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.15, duration: 0.45 }}
					className="mt-4"
				>
					{saved_at ? (
						<Alert variant="default" className="max-w-md mb-12">
							{isLocked ? <LockIcon className="size-4" /> : <CheckCircle2Icon className="size-4" />}
							<AlertTitle>
								{isLocked
									? `Locked at ${saved_at.toLocaleTimeString()}`
									: `Saved ${getRelativeTime(saved_at)} (${saved_at.toLocaleTimeString()})`}
							</AlertTitle>
							<AlertDescription>
								{isLocked
									? "Your predictions are locked in. Good luck!"
									: "You can update your predictions until you lock them."}
							</AlertDescription>
						</Alert>
					) : null}

					<PredictionForm predictions={predictions} onChange={setPredictions} readOnly={isLocked} />

					<div className="mt-8 flex flex-col sm:flex-row gap-3">
						{!isLocked && (
							<>
								{/* Save */}
								<button
									type="button"
									className="flex-1"
									onClick={savePredictions}
									disabled={saving}
								>
									<GlareHover
										height="48px"
										width="100%"
										background="transparent"
										borderRadius="12px"
										className="bg-secondary/20 hover:bg-secondary/80"
										glareColor="#d71414"
										glareOpacity={0.5}
										glareAngle={-70}
										glareSize={400}
										transitionDuration={2000}
										playOnce={false}
										hoverBackground="rgba(155,155,155,0.4)"
									>
										{saving ? <Spinner /> : <p>Save</p>}
									</GlareHover>
								</button>

								{/* Lock — only enabled when prediction is complete */}
								<button
									type="button"
									className="flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
									onClick={lockPrediction}
									disabled={locking || !isComplete}
									title={!isComplete ? "Complete all selections to lock" : undefined}
								>
									<GlareHover
										height="48px"
										width="100%"
										background="transparent"
										borderRadius="12px"
										className="bg-secondary/20 hover:bg-secondary/80"
										glareColor="#f59e0b"
										glareOpacity={0.6}
										glareAngle={-70}
										glareSize={400}
										transitionDuration={2000}
										playOnce={false}
										hoverBackground="rgba(155,155,155,0.4)"
									>
										{locking ? (
											<Spinner />
										) : (
											<span className="flex items-center justify-center gap-2">
												<LockIcon className="size-4" />
												<p>Lock Prediction</p>
											</span>
										)}
									</GlareHover>
								</button>
							</>
						)}

						{/* View League — always visible, red glare until locked */}
						<button
							type="button"
							className="flex-1"
							onClick={() => isLocked && navigate(`/race/${circuitCode}/league`)}
						>
							<GlareHover
								height="48px"
								width="100%"
								background="transparent"
								hoverBackground="rgba(155,155,155,0.4)"
								borderRadius="12px"
								className="bg-secondary/20"
								glareColor={isLocked ? "#6366f1" : "#f43f5e"}
								glareOpacity={0.5}
								glareAngle={-70}
								glareSize={400}
								transitionDuration={2000}
								playOnce={false}
							>
								<span className="flex items-center justify-center gap-2">
									{!isLocked && <LockIcon className="size-3 text-rose-400" />}
									<p className={!isLocked ? "text-rose-400" : ""}>
										{isLocked ? "View League" : "Lock to view league"}
									</p>
								</span>
							</GlareHover>
						</button>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
