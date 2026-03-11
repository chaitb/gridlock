import { motion } from "framer-motion";
import { Link } from "wouter";
import { Flag } from "@/components/flags";
import type { Race } from "@/shared/model";
import Countdown from "./Countdown";
import { POSTERS } from "./images/posters";

export function RaceHeader({
	race,
	countdown,
	isPrediction,
}: {
	race: Race;
	countdown?: Date | false | null;
	isPrediction?: boolean;
}) {
	const poster = POSTERS[race.circuit_code];
	const raceDate = race.getStartDateString();
	return (
		<motion.div
			className="relative mb-10"
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35 }}
		>
			<img
				src={poster}
				alt={race.name}
				className="absolute z-0 inset-0 object-cover w-full h-full"
			/>
			<div className="relative z-10 px-4 md:px-10 text-white w-full min-h-100 bg-linear-to-br from-red-500/40 to-black/60 py-6">
				<p className="text-sm font-kh">
					<Link to="/home" className="hover:underline">
						Home
					</Link>
					{" / "}
					<Link to="/race" className="hover:underline">
						Race Calendar
					</Link>
					{" / "}
					<Link to={`/race/${race.circuit_code}`} className="hover:underline">
						{race.name}
					</Link>
					{isPrediction && (
						<>
							{" / "}
							<Link to={`/race/${race.circuit_code}/prediction`} className="hover:underline">
								Predictions
							</Link>
						</>
					)}
				</p>
				<div className="flex flex-wrap items-center mt-12 flex-row">
					<h1 className="flex-1 font-round drop-shadow-xl tracking-wide text-6xl lg:text-9xl font-light mr-12 mb-4">
						{race.name}
					</h1>
					<Flag className="w-32 h-24 rounded-md shadow-xl mb-4" countryCode={race.country} />
				</div>
				<div className="font-kh">
					<p> Round {race.round}</p>
					<p> {race.venue}</p>
					<p> {raceDate}</p>
					{countdown && <Countdown date={countdown} className="p-12 md:p-20" />}
				</div>
			</div>
		</motion.div>
	);
}
