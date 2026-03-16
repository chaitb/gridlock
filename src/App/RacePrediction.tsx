import { motion } from "framer-motion";
import { isEqual } from "lodash";
import { CheckCircle2Icon, LockIcon, SaveIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import GlareHover from "@/components/GlareHover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { RACES_2026 } from "@/data";
import { useApi } from "@/helpers/useApi";
import { safeJsonParse } from "@/lib/utils";
import type { Prediction, PredictionContent } from "@/shared/model";
import { initialPredictions, predictionContentSchema } from "@/shared/model";
import { PredictionForm } from "./PredictionForm";
import { RaceHeader } from "./RaceHeader";

function getRelativeTime(date: Date): string {
	const minsAgo = Math.floor((Date.now() - date.getTime()) / 60_000);
	if (!Number.isFinite(minsAgo) || minsAgo < 1) return "just now";
	return `${minsAgo} min${minsAgo === 1 ? "" : "s"} ago`;
}

const glareButtonProps = {
	height: "80px",
	width: "100%",
	background: "transparent",
	hoverBackground: "rgba(255,255,255,0.06)",
	borderRadius: "12px",
	glareOpacity: 0.5,
	glareAngle: -70,
	glareSize: 400,
	transitionDuration: 2000,
	playOnce: false,
};

export function RacePrediction() {
	const params = useParams();
	const circuitCode = params.circuit_code;
	const race = RACES_2026.find((r) => r.circuit_code === circuitCode);
	const [, navigate] = useLocation();
	const [saving, setSaving] = useState(false);
	const [locking, setLocking] = useState(false);
	const [locked, setLocked] = useState(false);
	const [saved_at, setSaved_at] = useState<Date | "delta" | null>(null);
	const {
		data: savedPrediction,
		error,
		refetch,
	} = useApi<Prediction>(`/api/predictions`, {
		params: { circuitCode: circuitCode ?? "" },
	});

	const [predictions, setPredictions] = useState<PredictionContent>(initialPredictions);

	const isClosed = !race?.isOpenForPredictions();

	const onChangePredictions = (newPredictions: PredictionContent) => {
		setSaved_at("delta");
		setPredictions(newPredictions);
	};

	useEffect(() => {
		if (!savedPrediction?.prediction) return;

		const parsed_result = predictionContentSchema.safeParse(
			safeJsonParse(savedPrediction.prediction)
		);

		if (parsed_result.error) {
			console.log(parsed_result.error, savedPrediction);
			toast.error("Invalid prediction data", {
				description:
					"Your saved prediction data is corrupted. Please refresh the page." + parsed_result.error,
			});
			return;
		}

		const parsed = parsed_result.data;

		if (savedPrediction.updated_at) {
			const iso = `${savedPrediction.updated_at.replace(" ", "T")}Z`;
			setSaved_at(new Date(iso));
		}
		if (savedPrediction.locked) {
			setLocked(true);
		}

		setPredictions((prev) => {
			const same = isEqual(prev, parsed);
			return same ? prev : parsed;
		});
	}, [savedPrediction]);

	const isComplete = useMemo(() => {
		return Object.values(predictions).every((section) =>
			Object.values(section).every((driver) => driver !== null)
		);
	}, [predictions]);

	const completionPercent = useMemo(() => {
		const total = Object.values(predictions).reduce(
			(sum, section) => sum + Object.values(section).length,
			0
		);
		const filled = Object.values(predictions).reduce(
			(sum, section) => sum + Object.values(section).filter((d) => d !== null).length,
			0
		);
		return Math.round((filled / total) * 100);
	}, [predictions]);

	const savePredictions = useCallback(async () => {
		if (!circuitCode) {
			navigate("/");
			return;
		}

		setSaving(true);
		const response = await fetch("/api/predictions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				circuitCode,
				predictions,
				isComplete,
			}),
		});
		if (!response.ok) {
			const body = (await response.json().catch(() => ({}))) as { message?: string };
			toast.error("Failed to save predictions", {
				description: body.message ?? "Please try again.",
			});
			setSaving(false);
			return;
		}
		setSaving(false);
		toast.success("Prediction saved");
		refetch();
	}, [circuitCode, predictions, navigate, refetch, isComplete]);

	const lockPrediction = useCallback(async () => {
		if (!circuitCode) return;
		setLocking(true);
		const response = await fetch("/api/predictions/lock", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ circuitCode }),
		});
		if (!response.ok) {
			const body = (await response.json().catch(() => ({}))) as { message?: string };
			toast.error("Failed to lock prediction", {
				description: body.message ?? "Please try again.",
			});
		}
		setLocking(false);
		refetch();
	}, [circuitCode, refetch]);

	const Icon = useMemo(() => (locked ? LockIcon : CheckCircle2Icon), [locked]);
	if (!race) return <div>Race not found</div>;
	if (error) return <div>Error: {JSON.stringify(error)}</div>;

	return (
		<div className="min-h-screen mb-20">
			<RaceHeader
				race={race}
				countdown={race.isOpenForPredictions() && race.getPredictionLockDate()}
				isPrediction={true}
			/>
			<div className="mt-8 px-4 md:px-10 max-w-4xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.15, duration: 0.45 }}
					className="mt-4"
				>
					{saved_at ? (
						<Alert variant="destructive" className="w-full mb-6">
							<AlertTitle className="flex items-center gap-2">
								<Icon className="size-5" />
								<p className="text-xl">
									{saved_at === "delta"
										? "Unsaved changes..."
										: locked
											? `Locked at ${saved_at.toLocaleTimeString()}`
											: `Saved ${getRelativeTime(saved_at)} (${saved_at.toLocaleTimeString()})`}
								</p>
							</AlertTitle>
							<AlertDescription className="ml-7">
								{locked
									? "Your predictions are locked in. Good luck!"
									: "You can update your predictions until you lock them."}
							</AlertDescription>
						</Alert>
					) : null}

					{isClosed && (
						<Alert className="mb-6">
							<AlertTitle>Sorry, predictions are closed!</AlertTitle>
						</Alert>
					)}

					{/* Progress Bar */}
					{!locked && !isClosed && (
						<div className="mb-6">
							<div className="h-4 relative bg-secondary rounded-full overflow-hidden">
								<div className="w-full text-center px-4 font-orbiton uppercase absolute top-0 left-0 text-xs text-muted-foreground">
									{completionPercent === 0 ? "0%" : ` `}
								</div>
								<motion.div
									className="h-full bg-accent-foreground rounded-full"
									initial={{ width: 0 }}
									animate={{ width: `${completionPercent}%` }}
									transition={{ duration: 0.3, ease: "easeOut" }}
								/>
							</div>
						</div>
					)}

					<PredictionForm
						predictions={predictions}
						onChange={onChangePredictions}
						readOnly={locked || isClosed}
					/>

					<div className="mt-8 flex flex-col sm:flex-row gap-3">
						{!locked && !isClosed && (
							<>
								{/* Save */}
								<button
									type="button"
									className="flex-1"
									onClick={savePredictions}
									disabled={saving}
								>
									<GlareHover
										glareColor="#d71414"
										className="bg-secondary/20 hover:bg-secondary/80"
										{...glareButtonProps}
									>
										<span className="flex items-center justify-center gap-2 font-kh">
											<SaveIcon className="size-4" />
											{saving ? <Spinner /> : <p>Save</p>}
										</span>
									</GlareHover>
								</button>

								{/* Lock — only enabled when prediction is complete */}
								<button
									type="button"
									className="flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
									onClick={lockPrediction}
									disabled={locking || !isComplete || !saved_at || saved_at === "delta"}
									title={
										!isComplete
											? "Complete all selections to lock"
											: !saved_at
												? "Save your prediction before locking"
												: undefined
									}
								>
									<GlareHover
										glareColor="#f59e0b"
										className="bg-secondary/20 hover:bg-secondary/80"
										{...glareButtonProps}
									>
										{locking ? (
											<Spinner />
										) : (
											<span className="flex items-center justify-center gap-2 font-kh">
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
							onClick={() => (locked || isClosed) && navigate(`/race/${circuitCode}/league`)}
						>
							<GlareHover
								glareColor={locked ? "#6366f1" : "#f43f5e"}
								className="bg-secondary/20"
								{...glareButtonProps}
							>
								<span className="flex items-center justify-center gap-2 font-kh">
									{!locked && <LockIcon className="size-3 text-rose-400" />}
									<p className={!locked ? "text-rose-400" : ""}>League predictions</p>
								</span>
							</GlareHover>
						</button>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
