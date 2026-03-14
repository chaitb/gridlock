import { motion } from "framer-motion";
import { useState } from "react";
import { useRoute } from "wouter";
import { DRIVERS } from "@/App/driver";
import { AppLayout } from "@/App/Layout";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { SESSIONS } from "@/data";
import { useApi } from "@/helpers/useApi";
import type { Session, SessionResult } from "@/shared/model";
import { SessionResults } from "./SessionResults";

function getSessionInfo(sessionKey: number): Session | undefined {
	return SESSIONS.find((s) => s.session_key === sessionKey);
}

function formatPosition(
	position: number | null | undefined,
	dnf: boolean,
	dns: boolean,
	dsq: boolean
): string {
	if (dns) return "DNS";
	if (dsq) return "DSQ";
	if (dnf) return "DNF";
	if (!position) return "—";
	return `P${position}`;
}

function formatPoints(points: number | undefined): string {
	if (points === undefined || points === null) return "0";
	return points.toString();
}

function formatPositionsGained(
	starting: number | null | undefined,
	finishing: number | null | undefined,
	dnf: boolean,
	dns: boolean,
	dsq: boolean
): string {
	if (dns || dsq || dnf) return "—";
	if (starting == null || finishing == null) return "—";
	const diff = starting - finishing;
	if (diff === 0) return "0";
	if (diff > 0) return `+${diff}`;
	return `${diff}`;
}

export function DriverResults() {
	const [, params] = useRoute("/season/2026/:driver");
	const driverAcronym = params?.driver?.toUpperCase();
	const [selectedSession, setSelectedSession] = useState<Session | null>(null);

	const driver = DRIVERS.find((d) => d.acronym === driverAcronym);

	const {
		data: results,
		isLoading,
		error,
	} = useApi<SessionResult[]>("/api/driver-results", {
		params: driver ? { driver_number: driver.number } : undefined,
	});

	const filteredResults = results?.filter((result) => {
		const session = getSessionInfo(result.session_key);
		return session?.session_type !== "Practice";
	});

	if (!driver) {
		return (
			<AppLayout headline="Driver Not Found">
				<div className="mx-3 p-4 text-muted-foreground">
					No driver found with acronym "{driverAcronym}"
				</div>
			</AppLayout>
		);
	}

	return (
		<AppLayout headline={`${driver.full_name} - 2026 Results`}>
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="mx-3"
			>
				<div className="flex items-center gap-4 mb-6">
					<div className="w-4 h-16 rounded" style={{ backgroundColor: `#${driver.colour}` }} />
					<div>
						<h2 className="text-2xl font-semibold">{driver.full_name}</h2>
						<p className="text-muted-foreground">
							{driver.team_name} | #{driver.number}
						</p>
					</div>
				</div>

				{isLoading && (
					<div className="space-y-2">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} className="h-12 w-full" />
						))}
					</div>
				)}

				{error && <div className="text-red-500 p-4">Failed to load results</div>}

				{filteredResults && filteredResults.length === 0 && (
					<div className="text-muted-foreground p-4">No session results available yet.</div>
				)}

				{filteredResults && filteredResults.length > 0 && (
					<Dialog
						open={!!selectedSession}
						onOpenChange={(open) => !open && setSelectedSession(null)}
					>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Race</TableHead>
									<TableHead>Session</TableHead>
									<TableHead className="text-center">Grid</TableHead>
									<TableHead className="text-center">Finish</TableHead>
									<TableHead className="text-center">+/-</TableHead>
									<TableHead className="text-right">Points</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredResults.map((result, i) => {
									const session = getSessionInfo(result.session_key);
									return (
										<DialogTrigger asChild key={result.session_key}>
											<motion.tr
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: i * 0.03 }}
												className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
												onClick={() => session && setSelectedSession(session)}
											>
												<TableCell>{session?.location ?? "—"}</TableCell>
												<TableCell className="text-muted-foreground">
													{session?.session_name ?? "Unknown"}
												</TableCell>
												<TableCell className="text-center">
													{result.starting_position ?? "—"}
												</TableCell>
												<TableCell className="text-center font-medium">
													{formatPosition(result.position, result.dnf, result.dns, result.dsq)}
												</TableCell>
												<TableCell className="text-center">
													{formatPositionsGained(
														result.starting_position,
														result.position,
														result.dnf,
														result.dns,
														result.dsq
													)}
												</TableCell>
												<TableCell className="text-right">
													{(result.points ?? 0) > 0 ? (
														<span className="text-amber-400">{formatPoints(result.points)}</span>
													) : (
														<span className="text-muted-foreground">0</span>
													)}
												</TableCell>
											</motion.tr>
										</DialogTrigger>
									);
								})}
							</TableBody>
						</Table>
						{selectedSession && (
							<DialogContent className="md:max-w-[calc(100%-6rem)] xl:max-w-7xl">
								<SessionResults
									session={selectedSession}
									onDriverClick={() => setSelectedSession(null)}
								/>
							</DialogContent>
						)}
					</Dialog>
				)}

				{filteredResults && filteredResults.length > 0 && (
					<div className="mt-6 p-4 bg-secondary/30 rounded-lg">
						<div className="flex justify-between items-center">
							<span className="text-muted-foreground">Total Points</span>
							<span className="text-2xl font-bold text-amber-400">
								{filteredResults.reduce((sum, r) => sum + (r.points ?? 0), 0)}
							</span>
						</div>
					</div>
				)}
			</motion.div>
		</AppLayout>
	);
}
