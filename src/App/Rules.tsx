import { motion } from "framer-motion";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { AppLayout } from "./Layout";
import { H1, H2 } from "./Text";

const container = {
	hidden: {},
	show: { transition: { staggerChildren: 0.1 } },
};

const item = {
	hidden: { opacity: 0, y: 14 },
	show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function Rules() {
	return (
		<AppLayout headline="Rules">
			<motion.div variants={container} initial="hidden" animate="show" className="mx-3 max-w-2xl">
				<motion.div variants={item} className="mb-8">
					<p className="mt-4 text-muted-foreground">How GridLock works</p>
				</motion.div>

				<motion.div variants={item} className="mb-8">
					<H2>Prediction Lock</H2>
					<p className="text-muted-foreground leading-relaxed">
						Your predictions for each race are locked{" "}
						<span className="text-primary font-medium">before qualifying starts</span>. Once the
						qualifying session begins, you cannot change your predictions for that race. Make sure
						to submit your picks early!
					</p>
				</motion.div>

				<motion.div variants={item} className="mb-8">
					<H2>What to Predict</H2>
					<p className="text-muted-foreground leading-relaxed mb-4">
						For each race weekend, predict:
					</p>
					<ul className="space-y-2 text-muted-foreground">
						<li className="flex items-start gap-3">
							<span className="text-primary font-bold">•</span>
							<span>
								<span className="font-medium">Qualifying</span> — Top 5 grid positions
							</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-primary font-bold">•</span>
							<span>
								<span className="font-medium">Race</span> — Top 5 finishing positions
							</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-primary font-bold">•</span>
							<span>
								<span className="font-medium">Biggest Gainers</span> — 3 drivers who gain the most
								positions from grid to finish
							</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-primary font-bold">•</span>
							<span>
								<span className="font-medium">Biggest Losers</span> — 3 drivers who lose the most
								positions from grid to finish
							</span>
						</li>
					</ul>
				</motion.div>

				{/* ── SCORING ─────────────────────────────────────────── */}
				<motion.div variants={item} className="mb-8" id="scoring-qualifying">
					<H2>Scoring — Qualifying & Race</H2>
					<p className="text-muted-foreground leading-relaxed mb-4">
						Points use a <span className="text-primary font-medium">proximity model</span> — close
						guesses still earn partial credit.
					</p>
					<ul className="space-y-3 text-muted-foreground">
						<li className="flex items-start gap-3">
							<span className="text-primary font-bold min-w-[2.5rem]">10 pts</span>
							<span>
								<span className="text-primary font-medium">Bullseye</span> — exact position (you
								said P3, they finished P3)
							</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-primary font-bold min-w-[2.5rem]">5 pts</span>
							<span>
								<span className="font-medium">Near Miss ±1</span> — off by one slot (you said P3,
								they finished P2 or P4)
							</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-primary font-bold min-w-[2.5rem]">2 pts</span>
							<span>
								<span className="font-medium">Close ±2</span> — off by two slots (you said P3, they
								finished P1 or P5)
							</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-muted-foreground min-w-[2.5rem]">0 pts</span>
							<span>Off by 3 or more positions</span>
						</li>
					</ul>
				</motion.div>

				<motion.div variants={item} className="mb-8" id="scoring-gainers-losers">
					<H2>Scoring — Biggest Gainers & Losers</H2>
					<p className="text-muted-foreground leading-relaxed mb-4">
						These are harder to call, so the rewards are higher.
					</p>
					<ul className="space-y-3 text-muted-foreground">
						<li className="flex items-start gap-3">
							<span className="text-primary font-bold min-w-[2.5rem]">15 pts</span>
							<span>
								<span className="text-primary font-medium">Perfect Match</span> — you picked the #1
								gainer/loser exactly
							</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-primary font-bold min-w-[2.5rem]">7 pts</span>
							<span>
								<span className="font-medium">Top 3 Accuracy</span> — driver was in the Top 3
								gainers/losers, but not at the rank you predicted
							</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-primary font-bold min-w-[2.5rem]">3 pts</span>
							<span>
								<span className="font-medium">Trend Bonus</span> — driver gained/lost positions, but
								wasn't in the Top 3
							</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-muted-foreground min-w-[2.5rem]">0 pts</span>
							<span>Driver made no net position change</span>
						</li>
					</ul>
				</motion.div>

				{/* ── QUICK REFERENCE TABLE ───────────────────────────── */}
				<motion.div variants={item} className="mb-8">
					<H2>Quick Reference</H2>
					<Table className="mt-4">
						<TableHeader>
							<TableRow>
								<TableHead>Accuracy</TableHead>
								<TableHead className="text-center">Qualifying / Race</TableHead>
								<TableHead className="text-center">Gainer / Loser</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell className="font-medium">Exact position</TableCell>
								<TableCell className="text-center text-primary font-bold">10 pts</TableCell>
								<TableCell className="text-center text-primary font-bold">15 pts</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Off by 1 / Top 3</TableCell>
								<TableCell className="text-center font-medium">5 pts</TableCell>
								<TableCell className="text-center font-medium">7 pts</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className="font-medium">Off by 2 / Any +/-</TableCell>
								<TableCell className="text-center font-medium">2 pts</TableCell>
								<TableCell className="text-center font-medium">3 pts</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className="font-medium text-muted-foreground">Off by 3+</TableCell>
								<TableCell className="text-center text-muted-foreground">0 pts</TableCell>
								<TableCell className="text-center text-muted-foreground">0 pts</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</motion.div>

				{/* ── SPECIAL RULES ───────────────────────────────────── */}
				<motion.div variants={item} className="mb-8">
					<H2>Special Rules</H2>
					<ul className="space-y-4 text-muted-foreground">
						<li className="flex items-start gap-3">
							<span className="text-primary font-bold">•</span>
							<span>
								<span className="font-medium">DNF Rule</span> — If a driver you predicted for the
								Top 5 fails to finish (crash, mechanical), they are treated as finishing last for
								scoring purposes.
							</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-primary font-bold">•</span>
							<span>
								<span className="font-medium">Tie-Breaker</span> — Equal points? The player with
								more exact-match predictions wins. Still tied? The earlier submission wins.
							</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-primary font-bold">•</span>
							<span>
								<span className="font-medium">Hot Streak Bonus (+5 pts)</span> — Get at least one
								exact match in three consecutive races and earn a bonus 5 points.
							</span>
						</li>
					</ul>
				</motion.div>

				<motion.div variants={item} className="mb-8">
					<H2>Leaderboard Updates</H2>
					<p className="text-muted-foreground leading-relaxed">
						The leaderboard is updated{" "}
						<span className="text-primary font-medium">after each race</span>. Points accumulate
						throughout the season, so consistency is key. Check back after race weekends to see how
						you stack up.
					</p>
				</motion.div>
			</motion.div>
		</AppLayout>
	);
}
