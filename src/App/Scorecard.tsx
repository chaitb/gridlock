import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSessionByCircuitAndType } from "@/data";
import { cn } from "@/lib/utils";
import type {
	GainerLoserPredictionScore,
	PositionPredictionScore,
	PredictionContent,
	ScoreBreakdown,
	UserRaceScore,
} from "@/shared/model";
import { getScoreOutOf, type ScoringCategory } from "@/shared/scoringConfig";
import { DriverCard } from "./Drivers";
import { DriverPill } from "./PredictionCard";
import { PredictionForm } from "./PredictionForm";
import { SessionResults } from "./SessionResults";
import { H2 } from "./Text";

type ScorecardProps = {
	variant?: "default" | "split" | "unified";
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

export function Scorecard(props: ScorecardProps) {
	if (props.variant === "unified") {
		return <ScoreCardUnifiedLayout {...props} />;
	}
	return <ScoreCardSplitLayout {...props} />;
}

export const item = {
	hidden: { opacity: 0, y: 8 },
	show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export type BreakdownScoreDetails =
	| { type: "gainer_loser"; details: GainerLoserPredictionScore }
	| { type: "position"; details: PositionPredictionScore };

export function UnifiedScoreItem({
	position,
	section,
	score,
}: {
	position: string;
	section: ScoringCategory;
	score: BreakdownScoreDetails;
}) {
	const actualDriver =
		score.type === "position" ? score.details.actualDriver : score.details.actualDriverAtRank;

	return (
		<motion.div
			className="py-2 flex items-center gap-3 hover:bg-secondary/50 transition-colors rounded-lg px-2"
			variants={item}
		>
			<p className="text-3xl font-kh text-muted-foreground w-10">{position}</p>
			<DriverCard
				driverTag={score.details.driver}
				className="rounded-lg h-28 w-50"
				variant="no-bg"
			/>
			<div className="flex-1 flex items-center justify-center">
				<ScoreItem
					item={{
						accuracy: score.details.accuracy,
						points: score.details.points,
						score_out_of: getScoreOutOf(section, position),
					}}
					className="text-3xl"
				/>
			</div>
			{actualDriver ? (
				<DriverCard driverTag={actualDriver} className="rounded-lg h-28 w-36" variant="small" />
			) : (
				<div className="rounded-lg h-28 w-36 bg-muted/30 flex items-center justify-center text-muted-foreground text-sm">
					—
				</div>
			)}
		</motion.div>
	);
}

export function ScoreCardUnifiedLayout({ userRaceScore }: ScorecardProps) {
	// const race_session = getSessionByCircuitAndType(userRaceScore.circuitCode, "Race");
	// const qualifying_session = getSessionByCircuitAndType(userRaceScore.circuitCode, "Qualifying");

	// const {
	// 	data: race_results,
	// 	error: race_error,
	// 	isLoading: race_isLoading,
	// } = useApi<SessionResult[]>("/api/session-results", {
	// 	params: {
	// 		session_key: race_session!.session_key,
	// 	},
	// 	enabled: !!race_session,
	// });

	// const {
	// 	data: qualifying_results,
	// 	error: qualifying_error,
	// 	isLoading: qualifying_isLoading,
	// } = useApi<SessionResult[]>("/api/session-results", {
	// 	params: {
	// 		session_key: qualifying_session!.session_key,
	// 	},
	// 	enabled: !!qualifying_session,
	// });

	return (
		<div>
			<motion.div variants={sectionContainer} initial="hidden" animate="show" className="space-y-2">
				<H2>Qualifying</H2>
				{Object.entries(userRaceScore.breakdown.qualifying).map(([p, score]) => (
					<UnifiedScoreItem
						key={p}
						position={p}
						score={{ type: "position", details: score }}
						section={"qualifying"}
					/>
				))}
			</motion.div>
			<motion.div variants={sectionContainer} initial="hidden" animate="show" className="space-y-2">
				<H2>Race</H2>
				{Object.entries(userRaceScore.breakdown.race).map(([p, score]) => (
					<UnifiedScoreItem
						key={p}
						position={p}
						score={{ type: "position", details: score }}
						section={"race"}
					/>
				))}
			</motion.div>
			<motion.div variants={sectionContainer} initial="hidden" animate="show" className="space-y-2">
				<H2>Gainers</H2>
				{Object.entries(userRaceScore.breakdown.gainers).map(([p, score]) => (
					<UnifiedScoreItem
						key={p}
						position={p}
						score={{ type: "gainer_loser", details: score }}
						section={"gainers"}
					/>
				))}
			</motion.div>
			<motion.div variants={sectionContainer} initial="hidden" animate="show" className="space-y-2">
				<H2>Losers</H2>
				{Object.entries(userRaceScore.breakdown.losers).map(([p, score]) => (
					<UnifiedScoreItem
						key={p}
						position={p}
						score={{ type: "gainer_loser", details: score }}
						section={"losers"}
					/>
				))}
			</motion.div>
		</div>
	);
}

export function ScoreCardSplitLayout({ variant, userRaceScore, prediction }: ScorecardProps) {
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

type ScoreBreakdownItem = {
	key: string;
	driver: string;
	predicted: number;
	accuracy: string;
	points: number;
	score_out_of?: number;
	actual: React.ReactNode;
	extra?: React.ReactNode;
};

const Section = ({ title, items }: { title: React.ReactNode; items: ScoreBreakdownItem[] }) => {
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
							<ScoreItem item={item} />
						</div>
					</motion.div>
				))}
			</motion.div>
		</div>
	);
};

function ScoreItem({
	item,
	className,
}: {
	item: Pick<ScoreBreakdownItem, "score_out_of" | "accuracy" | "score_out_of" | "points">;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"font-medium text-yellow-400",
				{
					"text-green-400": item.accuracy === "bullseye" || item.accuracy === "perfect_match",
					"text-red-400": item.accuracy === "miss" || item.accuracy === "no_change",
				},
				className
			)}
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
	);
}
