import { motion } from "framer-motion";
import { ShuffleIcon } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
	type Driver,
	GAINER_KEYS,
	LOSER_KEYS,
	type PredictionContent,
	QUALIFYING_KEYS,
} from "@/shared/model";
import { randomizeSection } from "@/shared/predictionFormHelpers";
import { DriverSelect } from "./Drivers";
import { DRIVERS } from "./driver";
import { H2 } from "./Text";

export function objKeys<T extends object>(obj: T): Array<keyof T> {
	return Object.keys(obj) as Array<keyof T>;
}

type PredictionFormProps = {
	predictions: PredictionContent;
	onChange: (predictions: PredictionContent) => void;
	readOnly?: boolean;
	showSaveButton?: boolean;
	saving?: boolean;
	onSave?: () => void;
};

export function PredictionForm({
	predictions,
	onChange,
	readOnly = false,
	showSaveButton = false,
	saving = false,
	onSave,
}: PredictionFormProps) {
	const updatePredictions = useCallback(
		(section: "qualifying" | "race" | "gainers" | "losers", key: string, driver: Driver | null) => {
			if (readOnly) return;
			onChange({
				...predictions,
				[section]: {
					...predictions[section],
					[key]: driver?.acronym ?? null,
				},
			});
		},
		[predictions, onChange, readOnly]
	);

	const randomize = useCallback(
		(section_key: "qualifying" | "race" | "gainers" | "losers") => {
			if (readOnly) return;
			const updatedSection = randomizeSection(predictions[section_key]);
			onChange({
				...predictions,
				[section_key]: updatedSection,
			});
		},
		[predictions, onChange, readOnly]
	);

	const SectionHeader = ({
		title,
		sub,
		section_key,
		scoring_link,
	}: {
		title: string;
		sub: string;
		section_key: keyof PredictionContent;
		scoring_link: string;
	}) => (
		<>
			<H2>{title}</H2>
			<div className="flex gap-2 mt-2 min-w-0 items-center">
				<p className="pr-10 text-muted-foreground text-sm flex-grow">
					{sub}{" "}
					<a href={scoring_link} className="text-primary underline-offset-2 hover:underline">
						How scoring works →
					</a>
				</p>
				{!readOnly && (
					<Button
						variant={"ghost"}
						size={"xs"}
						className="text-sm py-0 my-0"
						onClick={() => randomize(section_key)}
					>
						<ShuffleIcon className="size-4 text-muted-foreground" />
					</Button>
				)}
			</div>
		</>
	);

	return (
		<div className="space-y-8 w-full min-w-0">
			<motion.div
				initial={{ opacity: 0, y: 14 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.15, duration: 0.45 }}
			>
				<SectionHeader
					title="Qualifying"
					sub="Top-5 grid prediction."
					scoring_link="/rules#scoring-qualifying"
					section_key="qualifying"
				/>
				<div className="flex flex-wrap gap-2 mt-2 min-w-0">
					{QUALIFYING_KEYS.map((key) => (
						<DriverSelect
							drivers={DRIVERS.filter(
								(dr) => !QUALIFYING_KEYS.some((k) => predictions.qualifying[k] === dr.acronym)
							)}
							key={`qualifying-${key}`}
							selectedDriver={predictions.qualifying[key]}
							title={`Select your ${key.toLocaleUpperCase()} Prediction`}
							onSelect={(driver) => updatePredictions("qualifying", key, driver)}
							disabled={readOnly}
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
				transition={{ delay: 0.25, duration: 0.45 }}
			>
				<SectionHeader
					title="Race"
					sub="Top-5 finishing prediction."
					scoring_link="/rules#scoring-race"
					section_key="race"
				/>
				<div className="flex flex-wrap gap-2 mt-2 min-w-0">
					{QUALIFYING_KEYS.map((key) => (
						<DriverSelect
							drivers={DRIVERS.filter(
								(dr) => !QUALIFYING_KEYS.some((k) => predictions.race[k] === dr.acronym)
							)}
							key={`race-${key}`}
							selectedDriver={predictions.race[key]}
							title={`Select your ${key.toLocaleUpperCase()} Prediction`}
							onSelect={(driver) => updatePredictions("race", key, driver)}
							disabled={readOnly}
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
				transition={{ delay: 0.35, duration: 0.45 }}
			>
				<SectionHeader
					title="Biggest Gainers"
					sub="3 drivers who gain the most positions from grid to finish."
					scoring_link="/rules#scoring-gainers-losers"
					section_key="gainers"
				/>
				<div className="flex flex-wrap gap-2 mt-2 min-w-0">
					{GAINER_KEYS.map((key) => (
						<DriverSelect
							drivers={DRIVERS.filter(
								(dr) => !GAINER_KEYS.some((k) => predictions.gainers[k] === dr.acronym)
							)}
							key={`gainers-${key}`}
							selectedDriver={predictions.gainers[key]}
							title={`Select your ${key.toLocaleUpperCase()} Prediction`}
							onSelect={(driver) => updatePredictions("gainers", key, driver)}
							disabled={readOnly}
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
				transition={{ delay: 0.45, duration: 0.45 }}
			>
				<SectionHeader
					title="Biggest Losers"
					sub="3 drivers who lose the most positions from grid to finish."
					scoring_link="/rules#scoring-gainers-losers"
					section_key="losers"
				/>
				<div className="flex flex-wrap gap-2 mt-2 min-w-0">
					{LOSER_KEYS.map((key) => (
						<DriverSelect
							drivers={DRIVERS.filter(
								(dr) => !LOSER_KEYS.some((k) => predictions.losers[k] === dr.acronym)
							)}
							key={`losers-${key}`}
							selectedDriver={predictions.losers[key]}
							title={`Select your ${key.toLocaleUpperCase()} Prediction`}
							onSelect={(driver) => updatePredictions("losers", key, driver)}
							disabled={readOnly}
						>
							<p className="text-xs font-kh">Select</p>
							<p className="text-4xl font-kh">{key.toLocaleUpperCase()}</p>
						</DriverSelect>
					))}
				</div>
			</motion.div>

			{showSaveButton && onSave && (
				<motion.div
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.55, duration: 0.45 }}
				>
					<button type="button" className="w-full" onClick={onSave} disabled={saving}>
						<div className="py-3 rounded-md bg-accent-foreground text-white font-medium text-sm tracking-wide disabled:opacity-50 transition-opacity text-center">
							{saving ? "Saving..." : "Save"}
						</div>
					</button>
				</motion.div>
			)}
		</div>
	);
}

export { QUALIFYING_KEYS, GAINER_KEYS, LOSER_KEYS };
