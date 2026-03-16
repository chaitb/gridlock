import { motion } from "framer-motion";
import { ClipboardCheck } from "lucide-react";
import { Link } from "wouter";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import type { Driver, PredictionContent } from "@/shared/model";
import { DriverCardFull } from "./Drivers";
import { DRIVERS } from "./driver";

export const container = {
	hidden: {},
	show: { transition: { staggerChildren: 0.05 } },
};

export const item = {
	hidden: { opacity: 0, y: 8 },
	show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function getDriverByAcronym(acronym: string | null) {
	if (!acronym) return null;
	return DRIVERS.find((d) => d.acronym === acronym);
}

export function DriverPill({
	acronym,
	link = false,
	size = "sm",
}: {
	acronym: string | null;
	link?: boolean;
	size?: "sm" | "md";
}) {
	const driver = getDriverByAcronym(acronym);
	if (!driver) {
		return (
			<span
				className={cn("rounded bg-muted text-muted-foreground", {
					"px-2 py-0.5 text-xs ": size === "sm",
					"px-3 py-1 text-base": size === "md",
				})}
			>
				—
			</span>
		);
	}
	const PillContent = link ? (
		<Link href={`/season/2026/${driver.acronym}`}>
			<DriverPillInner size={size} driver={driver} />
		</Link>
	) : (
		<DriverPillInner size={size} driver={driver} />
	);
	return (
		<HoverCard openDelay={100} closeDelay={300}>
			<HoverCardTrigger asChild>{PillContent}</HoverCardTrigger>
			<HoverCardContent
				className="w-80 p-0 border-none bg-transparent shadow-none backdrop-blur-lg"
				side="right"
				align="center"
				sideOffset={10}
			>
				<DriverCardFull driver={driver} className="w-full" />
			</HoverCardContent>
		</HoverCard>
	);
}

const DriverPillInner = ({ size, driver }: { size: "sm" | "md"; driver: Driver }) => (
	<span
		className={cn("rounded text-xs font-medium text-white cursor-pointer", {
			"px-2 py-0.5 text-xs": size === "sm",
			"px-3 py-1 text-sm": size === "md",
		})}
		style={{ backgroundColor: `#${driver.colour}` }}
	>
		{driver.acronym}
	</span>
);

export function PredictionSection({
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
			<p className="text-xs uppercase tracking-wider text-muted-foreground text-ellipsis overflow-hidden">
				{title}
			</p>
			<div className="flex flex-wrap gap-1">
				{keys.map((key) => (
					<DriverPill key={key} acronym={prediction[key]} />
				))}
			</div>
		</div>
	);
}

export function PredictionCardContent({
	content,
}: {
	content: {
		qualifying: Record<string, string | null>;
		race: Record<string, string | null>;
		gainers: Record<string, string | null>;
		losers: Record<string, string | null>;
	};
}) {
	return (
		<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
			<PredictionSection
				title="Qualifying"
				keys={["p1", "p2", "p3", "p4", "p5"]}
				prediction={content.qualifying}
			/>
			<PredictionSection
				title="Race"
				keys={["p1", "p2", "p3", "p4", "p5"]}
				prediction={content.race}
			/>
			<PredictionSection title="Gainers" keys={["g1", "g2", "g3"]} prediction={content.gainers} />
			<PredictionSection title="Losers" keys={["l1", "l2", "l3"]} prediction={content.losers} />
		</div>
	);
}

export function PredictionCard({
	header,
	content,
	score,
	username,
	circuitCode,
	onClick,
	children,
}: {
	header: React.ReactNode;
	content: PredictionContent | null;
	score?: number | null;
	username: string;
	circuitCode: string;
	onClick?: () => void;
	children?: React.ReactNode;
}) {
	return (
		<motion.li variants={item}>
			<div className="flex items-center gap-3 p-4 hover:bg-secondary transition-colors">
				<button
					type="button"
					className="flex-1 w-full text-left"
					onClick={onClick}
					disabled={!onClick}
				>
					{header}
					<div className="flex">
						<div className="flex-1">{content && <PredictionCardContent content={content} />}</div>
						{score !== undefined && score !== null && (
							<Link
								to={`/race/${circuitCode}/league/${username}`}
								className="flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
								onClick={(e) => e.stopPropagation()}
							>
								<div className="flex items-center gap-3 shrink-0">
									<span className="text-sm font-medium tabular-nums">{score} pts</span>
									<ClipboardCheck className="size-5" />
								</div>
							</Link>
						)}
					</div>
					{children}
				</button>
			</div>
		</motion.li>
	);
}
