import { motion } from "framer-motion";
import { Link } from "wouter";
import { type CountryCode, Flag } from "@/components/flags";
import { useApi } from "@/helpers/useApi";
import { useUser } from "@/context/useUser";
import { AppLayout } from "./Layout";
import { RACES_2026 } from "./RaceWeekend";
import { DRIVERS } from "./driver";
import type { Prediction, PredictionContent } from "@/model";

type MyPredictionsResponse = {
	predictions: Prediction[];
};

const container = {
	hidden: {},
	show: { transition: { staggerChildren: 0.05 } },
};

const item = {
	hidden: { opacity: 0, y: 8 },
	show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const QUALIFYING_KEYS = ["p1", "p2", "p3", "p4", "p5"] as const;
const GAINER_KEYS = ["g1", "g2", "g3"] as const;
const LOSER_KEYS = ["l1", "l2", "l3"] as const;

function getDriverByAcronym(acronym: string | null) {
	if (!acronym) return null;
	return DRIVERS.find((d) => d.acronym === acronym);
}

function DriverPill({ acronym }: { acronym: string | null }) {
	const driver = getDriverByAcronym(acronym);
	if (!driver) {
		return (
			<span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">—</span>
		);
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
			<p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
			<div className="flex flex-wrap gap-1">
				{keys.map((key) => (
					<DriverPill key={key} acronym={prediction[key]} />
				))}
			</div>
		</div>
	);
}

export function MyPredictions() {
	const { user } = useUser();
	const { data, isLoading, error } = useApi<MyPredictionsResponse>("/api/my-predictions");

	if (!user) {
		return (
			<AppLayout headline="My Predictions">
				<p className="text-muted-foreground">Please log in to view your predictions.</p>
			</AppLayout>
		);
	}

	if (isLoading) {
		return (
			<AppLayout headline="My Predictions">
				<p className="text-muted-foreground">Loading...</p>
			</AppLayout>
		);
	}

	if (error) {
		return (
			<AppLayout headline="My Predictions">
				<p className="text-destructive">Error: {error.message}</p>
			</AppLayout>
		);
	}

	const predictions = data?.predictions ?? [];
	const predictionsByRace = new Map<string, Prediction>();
	for (const pred of predictions) {
		predictionsByRace.set(pred.race_code, pred);
	}

	return (
		<AppLayout headline="My Predictions">
			{predictions.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="space-y-4"
				>
					<p className="text-muted-foreground">You haven't made any predictions yet.</p>
					<Link
						to="/race"
						className="inline-block text-accent-foreground underline underline-offset-2 hover:no-underline"
					>
						Browse races →
					</Link>
				</motion.div>
			) : (
				<motion.ul
					variants={container}
					initial="hidden"
					animate="show"
					className="flex flex-col divide-y divide-border"
				>
					{RACES_2026.map((race) => {
						const pred = predictionsByRace.get(race.code);
						if (!pred) return null;

						let content: PredictionContent | null = null;
						try {
							content = JSON.parse(pred.prediction ?? "{}") as PredictionContent;
						} catch {
							return null;
						}

						const updated = pred.updated_at
							? new Date(pred.updated_at.replace(" ", "T") + "Z")
							: null;

						return (
							<motion.li key={race.code} variants={item}>
								<Link
									to={`/race/${race.code}/prediction`}
									className="block p-4 hover:bg-secondary transition-colors"
								>
									<div className="flex items-center gap-3 mb-3">
										<Flag
											className="size-5 rounded-full shadow-sm"
											countryCode={race.country as CountryCode}
										/>
										<span className="font-medium">{race.name}</span>
										{updated && (
											<span className="text-xs text-muted-foreground ml-auto">
												{updated.toLocaleDateString()}
											</span>
										)}
									</div>
									<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
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
								</Link>
							</motion.li>
						);
					})}
				</motion.ul>
			)}
		</AppLayout>
	);
}
