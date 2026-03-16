import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSessionByCircuitAndType } from "@/data/index";
import type { PredictionContent, ScoreBreakdown, UserRaceScore } from "@/shared/model";
import { getScoreOutOf } from "@/shared/scoringConfig";
import { DriverPill } from "./PredictionCard";
import { PredictionForm } from "./PredictionForm";
import { SessionResults } from "./SessionResults";
import { H2 } from "./Text";

type ScorecardProps = {
	variant?: "default" | "split";
	userRaceScore: UserRaceScore;
	prediction: PredictionContent;
};

const sectionContainer = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.08 },
	},
};

const sectionItem = {
	hidden: { opacity: 0, y: 12 },
	show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
};

const cardContainer = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.1 },
	},
};

const cardItem = {
	hidden: { opacity: 20, scale: 0.96 },
	show: { opacity: 1, scale: 1, transition: { duration: 0.1, ease: "easeOut" as const } },
};

export function Scorecard({ variant = "default", userRaceScore, prediction }: ScorecardProps) {
	const race_session = getSessionByCircuitAndType(userRaceScore.circuitCode, "Race");
	const qualifying_session = getSessionByCircuitAndType(userRaceScore.circuitCode, "Qualifying");
	return (
		<div className="flex gap-4">
			{variant === "split" && (
				<div className="w-1/2 flex-1">
					<p className="text-muted-foreground inline-flex items-center border-b border-border w-full h-10 pb-0.5 text-sm py-1">
						Scores
					</p>
					<div className=" mt-6">
						<BreakdownView breakdown={userRaceScore.breakdown} />
					</div>
				</div>
			)}
			<Tabs
				defaultValue={variant === "split" ? "prediction" : "scores"}
				className={`${variant === "split" ? "w-1/2 mx-auto" : "w-full"}`}
			>
				<div className="overflow-x-scroll no-scrollbar w-full max-w-screen-xs sm:max-w-content">
					<TabsList variant="line" className="mb-4">
						{variant === "default" && (
							<TabsTrigger variant="line" value="scores">
								Scores
							</TabsTrigger>
						)}
						<TabsTrigger variant="line" value="prediction">
							My Prediction
						</TabsTrigger>
						<TabsTrigger variant="line" value="qualifying_results">
							Qualifying
						</TabsTrigger>
						<TabsTrigger variant="line" value="race_results">
							Race
						</TabsTrigger>
					</TabsList>
				</div>

				{variant === "default" && (
					<TabsContent value="scores">
						<BreakdownView breakdown={userRaceScore.breakdown} />
					</TabsContent>
				)}

				<TabsContent value="prediction" className="pl-3">
					<PredictionForm helpText={false} predictions={prediction} onChange={() => {}} readOnly />
				</TabsContent>

				<TabsContent value="qualifying_results">
					{qualifying_session ? (
						<motion.div
							initial={{ opacity: 0, y: 50 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.15, duration: 0.45 }}
							exit={{ opacity: 0 }}
							className="w-full"
						>
							<SessionResults session={qualifying_session} />
						</motion.div>
					) : (
						<div className="text-muted-foreground text-sm">
							Session {userRaceScore.session_key || "<undefined session_key>"} not found
						</div>
					)}
				</TabsContent>

				<TabsContent value="race_results">
					{race_session ? (
						<motion.div
							initial={{ opacity: 0, y: 50 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.15, duration: 0.45 }}
							exit={{ opacity: 0 }}
							className="w-full"
						>
							<SessionResults session={race_session} />
						</motion.div>
					) : (
						<div className="text-muted-foreground text-sm">
							Session {userRaceScore.session_key || "<undefined session_key>"} not found
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}

export const BreakdownView = ({ breakdown }: { breakdown: ScoreBreakdown }) => {
	const bonusTotal = breakdown.bonuses.reduce((sum, b) => sum + b.points, 0);

	return (
		<div className="flex-1 overflow-y-auto pb-4 w-full">
			<motion.div variants={sectionContainer} initial="hidden" animate="show" className="space-y-8">
				<motion.div variants={sectionItem}>
					<Section
						title="Qualifying"
						items={Object.entries(breakdown.qualifying).map(([key, val]) => ({
							key,
							driver: val.driver,
							predicted: val.predicted,
							actual: val.actual !== null ? `${val.actual}` : "—",
							accuracy: val.accuracy,
							score_out_of: getScoreOutOf("qualifying", key),
							points: val.points,
						}))}
					/>
				</motion.div>
				<motion.div variants={sectionItem}>
					<Section
						title="Race"
						items={Object.entries(breakdown.race).map(([key, val]) => ({
							key,
							driver: val.driver,
							predicted: val.predicted,
							actual: val.actual !== null ? `${val.actual}` : "—",
							accuracy: val.accuracy,
							score_out_of: getScoreOutOf("race", key),
							points: val.points,
						}))}
					/>
				</motion.div>
				<motion.div variants={sectionItem}>
					<Section
						title="Gainers"
						items={Object.entries(breakdown.gainers).map(([key, val]) => ({
							key,
							driver: val.driver,
							predicted: val.predictedRank,
							actual: val.actualRank !== null ? `${val.actualRank}` : "—",
							accuracy: val.accuracy,
							score_out_of: getScoreOutOf("gainers", key),
							points: val.points,
							extra:
								val.gainedLost < 0 ? (
									<span className="text-xl text-red-400 whitespace-nowrap">
										<ArrowDown className="size-5 inline-flex mb-1" />
										{val.gainedLost}
									</span>
								) : (
									<span className="text-xl text-green-400 whitespace-nowrap">
										<ArrowUp className="size-5 inline-flex mb-1" />
										{val.gainedLost}
									</span>
								),
						}))}
					/>
				</motion.div>
				<motion.div variants={sectionItem}>
					<Section
						title="Losers"
						items={Object.entries(breakdown.losers).map(([key, val]) => ({
							key,
							driver: val.driver,
							predicted: val.predictedRank,
							actual: val.actualRank !== null ? `${val.actualRank}` : "—",
							accuracy: val.accuracy,
							score_out_of: getScoreOutOf("losers", key),
							points: val.points,
							extra:
								val.gainedLost < 0 ? (
									<span className="text-xl text-red-400 whitespace-nowrap">
										<ArrowDown className="size-5 inline-flex" />
										{val.gainedLost}
									</span>
								) : (
									<span className="text-xl text-green-400 whitespace-nowrap">
										<ArrowUp className="size-5 inline-flex" />
										{val.gainedLost}
									</span>
								),
						}))}
					/>
				</motion.div>
				{breakdown.bonuses.length > 0 && (
					<motion.div variants={sectionItem} className="space-y-2">
						<h4 className="text-sm font-medium text-muted-foreground">Bonuses</h4>
						{breakdown.bonuses.map((b) => (
							<div key={b.type} className="flex justify-between text-sm">
								<span className="capitalize">{b.type.replace(/_/g, " ")}</span>
								<span className="text-green-400 font-medium">+{b.points}</span>
							</div>
						))}
						<div className="flex justify-between text-sm font-medium pt-2 border-t">
							<span>Bonus Total</span>
							<span className="text-green-400">+{bonusTotal}</span>
						</div>
					</motion.div>
				)}
			</motion.div>
		</div>
	);
};

const Section = ({
	title,
	items,
}: {
	title: React.ReactNode;
	items: {
		key: string;
		driver: string;
		predicted: number;
		actual: React.ReactNode;
		accuracy: React.ReactNode;
		points: number;
		score_out_of?: number;
		extra?: React.ReactNode;
	}[];
}) => {
	const total = items.reduce((sum, i) => sum + i.points, 0);
	const maxTotal = items.reduce((sum, i) => sum + (i.score_out_of || 0), 0);
	return (
		<div className="space-y-2">
			<div className="flex justify-between items-center">
				<H2 className="grow">{title}</H2>
				<span className="text-2xl font-medium">{total} </span>
				<span className="text-2xl text-muted-foreground font-medium">&nbsp;/ {maxTotal}</span>
			</div>
			<motion.div
				variants={cardContainer}
				initial="hidden"
				animate="show"
				// md:flex-nowrapno-scrollbar overflow-x-scroll
				className="flex flex-wrap gap-2"
			>
				{items.map((item) => (
					<motion.div
						key={item.key}
						variants={cardItem}
						className="flex-1 w-full min-w-24 h-36 space-y-4 p-1.5 md:p-2.5 flex flex-col justify-between text-sm rounded-lg bg-muted"
					>
						<div className="flex flex-wrap gap-2 justify-between items-center">
							<span className="font-mono text-3xl uppercase text-muted-foreground">{item.key}</span>
							<span className="font-medium">
								{item.driver ? <DriverPill link size="md" acronym={item.driver} /> : "—"}
							</span>
						</div>
						<Separator className="my-auto bg-muted-foreground/10" />
						<div className="tracking-tight leading-tight flex justify-between items-end gap-3 text-xs">
							<div className="text-muted-foreground mb-1">
								<p className="whitespace-nowrap">P: {item.predicted}</p>
								<p className="whitespace-nowrap">A: {item.actual}</p>
							</div>
							{item.extra}
							<span
								className={`font-medium ${
									item.accuracy === "bullseye" || item.accuracy === "perfect_match"
										? "text-green-400"
										: item.accuracy === "miss" || item.accuracy === "no_change"
											? "text-red-400"
											: "text-yellow-400"
								}`}
							>
								{item.score_out_of ? (
									<span className="text-nowrap">
										<span className="text-2xl md:text-3xl">{item.points}</span>
										<span className="text-muted-foreground text-xs"> / {item.score_out_of}</span>
									</span>
								) : item.points > 0 ? (
									`+${item.points}`
								) : (
									"0"
								)}
							</span>
						</div>
					</motion.div>
				))}
			</motion.div>
		</div>
	);
};
