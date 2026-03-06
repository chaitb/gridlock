import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { DriverSelect, type Driver } from "./Drivers";
import { POSTERS } from "./images/posters";
import { RaceHeader } from "./RaceHeader";
import { RACES_2026 } from "./RaceWeekend";
import { H1 } from "./Text";
import { DRIVERS } from "./driver";
import { useUser } from "@/context/useUser";
import { useApi } from "@/helpers/useApi";
import type { Prediction, PredictionContent } from "@/model";
import { initialPredictions } from "@/model";
import GlareHover from "@/components/GlareHover";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2Icon } from "lucide-react";

const QUALIFYING_KEYS = ["p1", "p2", "p3", "p4", "p5"] as const;
const GAINER_KEYS = ["g1", "g2", "g3"] as const;
const LOSER_KEYS = ["l1", "l2", "l3"] as const;

export function RacePrediction() {
	const params = useParams();
	const { user } = useUser();
	const code = params.code;
	const race = RACES_2026.find((r) => r.code === code);
	const [, navigate] = useLocation();
	const [saving, setSaving] = useState(false);
	const [saved_at, setSaved_at] = useState<Date | null>(null);
	const {
		data: savedPrediction,
		isLoading,
		error,
		refetch,
	} = useApi<Prediction>(`/api/predictions`, {
		params: {
			raceCode: code ?? "",
		},
	});

	const [predictions, setPredictions] = useState<PredictionContent>(initialPredictions);

	useEffect(() => {
		if (!savedPrediction?.prediction) return;
		console.log("fetched prediction", savedPrediction);

		const parsed = JSON.parse(savedPrediction.prediction) as PredictionContent;

		if (savedPrediction.updated_at) {
			setSaved_at(new Date(savedPrediction.updated_at + " UTC"));
		}

		// Avoid unnecessary setState if the parsed value is equal
		setPredictions((prev) => {
			const same = JSON.stringify(prev) === JSON.stringify(parsed);
			return same ? prev : parsed;
		});
	}, [savedPrediction?.prediction, savedPrediction?.updated_at]);

	const savePredictions = useCallback(async () => {
		if (!user?.id || !code) {
			navigate("/");
			return;
		}

		const isComplete = Object.values(predictions).every((section) => {
			return Object.values(section).every((driver) => driver !== null);
		});

		setSaving(true);
		const response = await fetch(`/api/predictions`, {
			method: "POST",
			body: JSON.stringify({
				userId: user?.id,
				raceCode: code,
				predictions,
				isComplete,
				created_at: savedPrediction?.created_at ?? new Date().toISOString(),
			}),
		});
		if (!response.ok) {
			throw new Error("Failed to save predictions");
		}
		const data = await response.json();
		console.log("Saved prediction", data);
		setSaving(false);
		refetch();
	}, [user, code, predictions, navigate, savedPrediction?.created_at, refetch]);

	const updatePredictions = useCallback(
		(section: "qualifying" | "race" | "gainers" | "losers", key: string, driver: Driver | null) => {
			setPredictions((prev) => ({
				...prev,
				[section]: {
					...prev[section],
					[key]: driver?.acronym ?? null,
				},
			}));
		},
		[]
	);

	if (!race) {
		return <div>Race not found</div>;
	}

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {JSON.stringify(error)}</div>;
	}

	return (
		<div className="min-h-screen mb-20">
			<RaceHeader
				poster={POSTERS[race.code]}
				name={race.name}
				country={race.country}
				round={race.round}
				venue={race.venue}
				date={race.date}
				raceCode={race.code}
			/>

			<div className="mt-8 px-4 md:px-10 max-w-4xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.15, duration: 0.45 }}
					className="mt-4"
				>
					{saved_at ? (
						<Alert variant={"default"} className="max-w-md mb-12">
							<CheckCircle2Icon />
							<AlertTitle>
								Saved at {saved_at.toLocaleString()} (
								{Math.floor((new Date().getTime() - saved_at.getTime()) / 1000 / 60)} mins ago)
							</AlertTitle>
							<AlertDescription>
								You can update your predictions until the start of the race.
							</AlertDescription>
						</Alert>
					) : null}

					<H1>Qualifying</H1>
					<p className="text-muted-foreground text-sm">
						Your top-5 grid prediction.{" "}
						<a href="/rules#scoring-qualifying" className="text-primary underline-offset-2 hover:underline">
							How scoring works →
						</a>
					</p>
					<div className="flex flex-wrap md:flex-nowrap gap-2 mt-2">
						{QUALIFYING_KEYS.map((key) => (
							<DriverSelect
								drivers={DRIVERS.filter(
									(dr) => !QUALIFYING_KEYS.some((k) => predictions.qualifying[k] === dr.acronym)
								)}
								key={`qualifying-${key}`}
								selectedDriver={predictions.qualifying[key]}
								title={`Select your ${key.toLocaleUpperCase()} Prediction`}
								onSelect={(driver) => {
									updatePredictions("qualifying", key, driver);
								}}
							>
								<p className="text-xs font-kh">Select</p>
								<p className="text-4xl font-kh">{key.toLocaleUpperCase()}</p>
							</DriverSelect>
						))}
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.45 }}
					className="mt-8"
				>
					<H1>Race</H1>
					<p className="text-muted-foreground text-sm">
						Your top-5 finishing prediction.{" "}
						<a href="/rules#scoring-qualifying" className="text-primary underline-offset-2 hover:underline">
							How scoring works →
						</a>
					</p>
					<div className="flex flex-wrap md:flex-nowrap gap-2 mt-2">
						{QUALIFYING_KEYS.map((key) => (
							<DriverSelect
								drivers={DRIVERS.filter(
									(dr) => !QUALIFYING_KEYS.some((k) => predictions.race[k] === dr.acronym)
								)}
								key={`race-${key}`}
								selectedDriver={predictions.race[key]}
								title={`Select your ${key.toLocaleUpperCase()} Prediction`}
								onSelect={(driver) => {
									updatePredictions("race", key, driver);
								}}
							>
								<p className="text-xs font-kh">Select</p>
								<p className="text-4xl font-kh">{key}</p>
							</DriverSelect>
						))}
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.45 }}
					className="mt-8"
				>
					<H1>Biggest Gainers</H1>
					<p className="text-muted-foreground text-sm">
						3 drivers who gain the most positions from grid to finish.{" "}
						<a href="/rules#scoring-gainers-losers" className="text-primary underline-offset-2 hover:underline">
							How scoring works →
						</a>
					</p>
					<div className="flex flex-wrap md:flex-nowrap gap-2 mt-2">
						{GAINER_KEYS.map((key) => (
							<DriverSelect
								drivers={DRIVERS.filter(
									(dr) => !GAINER_KEYS.some((k) => predictions.gainers[k] === dr.acronym)
								)}
								key={`gainers-${key}`}
								selectedDriver={predictions.gainers[key]}
								title={`Select your ${key.toLocaleUpperCase()} Prediction`}
								onSelect={(driver) => {
									updatePredictions("gainers", key, driver);
								}}
							>
								<p className="text-xs font-kh">Select</p>
								<p className="text-4xl font-kh">{key.toLocaleUpperCase()}</p>
							</DriverSelect>
						))}
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.45 }}
					className="mt-8"
				>
					<H1>Biggest Losers</H1>
					<p className="text-muted-foreground text-sm">
						3 drivers who lose the most positions from grid to finish.{" "}
						<a href="/rules#scoring-gainers-losers" className="text-primary underline-offset-2 hover:underline">
							How scoring works →
						</a>
					</p>
					<div className="flex flex-wrap md:flex-nowrap gap-2 mt-2">
						{LOSER_KEYS.map((key) => (
							<DriverSelect
								drivers={DRIVERS.filter(
									(dr) => !LOSER_KEYS.some((k) => predictions.losers[k] === dr.acronym)
								)}
								key={`losers-${key}`}
								selectedDriver={predictions.losers[key]}
								title={`Select your ${key.toLocaleUpperCase()} Prediction`}
								onSelect={(driver) => {
									updatePredictions("losers", key, driver);
								}}
							>
								<p className="text-xs font-kh">Select</p>
								<p className="text-4xl font-kh">{key.toLocaleUpperCase()}</p>
							</DriverSelect>
						))}
					</div>
				</motion.div>
			</div>

			<div className="mt-8 px-4 md:px-10 max-w-4xl mx-auto">
				<button type="button" className="w-full" onClick={savePredictions}>
					<GlareHover
						height="48px"
						width="100%"
						background="transparent"
						borderRadius="12px"
						className="bg-secondary/20 hover:bg-secondary/80"
						glareColor="#d71414"
						glareOpacity={0.8}
						glareAngle={-30}
						glareSize={400}
						transitionDuration={1000}
						playOnce={false}
					>
						{saving ? <Spinner /> : <p>Save</p>}
					</GlareHover>
				</button>
			</div>
			{/* <div className="mt-8 px-4 md:px-10 max-w-4xl mx-auto">
				<BGButton onClick={savePredictions}>Save Predictions</BGButton>
			</div> */}

			{/* <div className="mt-20 px-10 flex flex-wrap gap-4">
				{DRIVERS.map((dr) => {
					return (
						<DriverCard
							className="min-w-48"
							key={dr.acronym}
							driverTag={dr.acronym}
						/>
					);
				})}
			</div> */}
		</div>
	);
}
