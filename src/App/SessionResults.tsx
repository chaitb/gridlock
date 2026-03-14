import { motion } from "framer-motion";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/helpers/useApi";
import { useMediaQuery } from "@/helpers/useMediaQuery";
import type { Session, SessionResult } from "@/shared/model";
import { DriverCardCompact, DriverCardFull } from "./Drivers";
import { DRIVERS } from "./driver";

const SKELETON_KEYS = Array.from({ length: 22 }, (_, i) => `skeleton-${i}`);

function formatGap(position: number | null, gap: SessionResult["gap_to_leader"]): string[] {
	if (typeof gap === "string") {
		if (gap.includes(",")) {
			return gap.split(",").flatMap((g) => formatGap(position, g.trim()));
		}
		return Number.isNaN(Number(gap)) ? [gap] : formatGap(position, Number(gap));
	}
	if (Array.isArray(gap)) return gap.flatMap((g) => formatGap(position, g));
	if (gap === null || gap === 0) {
		if (position === 1) return ["Leader"];
		return [];
	}
	const minutes = Math.floor(gap / 60);
	const seconds = gap % 60;
	if (minutes > 0) return [`+${minutes}:${seconds.toFixed(3).padStart(6, "0")}`];
	return [`+${seconds.toFixed(3)}s`];
}

export function SessionResults({
	session,
	onDriverClick,
}: {
	session: Session;
	onDriverClick?: () => void;
}) {
	const isLg = useMediaQuery("(min-width: 1024px)");
	const cols = isLg ? 3 : 2;
	const {
		data: results,
		error,
		isLoading,
	} = useApi<SessionResult[]>("/api/session-results", {
		params: {
			session_key: session.session_key,
		},
	});

	const isPast = new Date(session.date_end) < new Date();

	if (!isPast) {
		return (
			<article className="p-4 text-muted-foreground text-sm">
				Results will be available after the session ends.
			</article>
		);
	}

	if (error) {
		return <div className="text-red-500">{error.message}</div>;
	}

	if (isLoading || !results) {
		return (
			<div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-y-auto max-h-[calc(100vh-10rem)]">
				{SKELETON_KEYS.map((key) => (
					<Skeleton key={key} className="w-30 h-40 lg:w-40 lg:h-48" />
				))}
			</div>
		);
	}

	const sorted = [...results].sort((a, b) => {
		if (!a.position && b.position) return 1;
		if (!b.position && a.position) return -1;
		if (!a.position && !b.position) {
			if (a.dns && !b.dns) return 1;
			if (!a.dns && b.dns) return -1;
		}
		if (a.position && b.position) {
			return a.position - b.position;
		}
		return 0;
	});

	return (
		<div className="overflow-y-auto no-scrollbar max-h-[calc(100vh-10rem)]">
			<h2 className="text-3xl font-semibold mb-3 font-audiowide px-4 text-center uppercase">
				{session.circuit_code} {session.session_name} Results
			</h2>
			<div className="sm:px-12 pt-8 grid grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-12 mx-auto max-w-5xl">
				{sorted.map((result, i) => {
					const driver = DRIVERS.find((d) => d.number === result.driver_number);
					const status = result.dnf ? "DNF" : result.dns ? "DNS" : result.dsq ? "DSQ" : null;
					return (
						<motion.div
							initial={{ opacity: 0, x: -5, y: 10 * (i % cols) }}
							animate={{ opacity: 1, x: 0, y: 14 * (i % cols) }}
							transition={{
								delay: 0.03 * (i + (i % cols)),
								duration: 0.2,
								type: "spring",
								stiffness: 200,
								damping: 25,
							}}
							key={result.driver_number}
							className="flex flex-row items-center gap-3"
						>
							{driver ? (
								<Link
									to={`/season/2026/${driver.acronym}`}
									className="cursor-pointer"
									onClick={onDriverClick}
								>
									<DriverCardCompact
										driver={driver}
										className="block md:hidden w-20 h-30 rounded-lg shrink-0"
									/>
									<DriverCardFull
										driver={driver}
										className="hidden md:block w-48 h-36 rounded-md shrink-0"
									/>
								</Link>
							) : (
								<div className="h-28 rounded-md shrink-0 bg-secondary/40 flex items-center justify-center text-xs text-muted-foreground">
									#{result.driver_number}
								</div>
							)}
							<div className="flex flex-col gap-0.5">
								<span className="font-kh text-xl lg:text-3xl font-bold">
									{status ?? (result.position ? `P${result.position}` : "—")}
								</span>
								<div className="text-sm text-muted-foreground font-kh">
									{formatGap(result.position, result.gap_to_leader).map((g) => (
										<div key={g}>{g}</div>
									))}
								</div>
								{(result.points ?? 0) > 0 && (
									<span className="text-sm font-kh text-amber-400">{result.points} pts</span>
								)}
							</div>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}
