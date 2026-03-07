import { DRIVERS } from "./driver";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { DriverCardFull } from "./Drivers";

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

export function DriverPill({ acronym }: { acronym: string | null }) {
	const driver = getDriverByAcronym(acronym);
	if (!driver) {
		return <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">—</span>;
	}
	return (
		<HoverCard openDelay={100} closeDelay={300}>
			<HoverCardTrigger asChild>
				<span
					className="px-2 py-0.5 rounded text-xs font-medium text-white cursor-pointer"
					style={{ backgroundColor: `#${driver.colour}` }}
				>
					{driver.acronym}
				</span>
			</HoverCardTrigger>
			<HoverCardContent className="w-80 p-0" side="right" align="center" sideOffset={10}>
				<DriverCardFull driver={driver} className="w-full" />
			</HoverCardContent>
		</HoverCard>
	);
}

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
			<p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
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
