import { motion } from "framer-motion";
import { Link } from "wouter";
import { Flag } from "@/components/flags";
import type { CountryCode } from "@/components/flags";
import Countdown from "./Countdown";
import type { RaceCode } from "./RaceWeekend";

type RaceHeaderProps = {
	poster: string;
	name: string;
	country: CountryCode;
	round: number;
	venue: string;
	date: Date;
	raceCode: RaceCode;
};

export function RaceHeader({
	poster,
	name,
	country,
	round,
	venue,
	date,
	raceCode,
}: RaceHeaderProps) {
	const today = new Date();
	const isUpcoming = date >= today;

	const raceDate = date.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<motion.div
			className="relative mb-10"
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35 }}
		>
			<img src={poster} alt={name} className="absolute z-0 inset-0 object-cover w-full h-full" />
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
					<Link to={`/race/${raceCode}`} className="hover:underline">
						{name}
					</Link>
				</p>
				<div className="flex flex-wrap items-center mt-12 flex-row">
					<h1 className="flex-1 font-round drop-shadow-xl tracking-wide text-6xl lg:text-9xl font-light mr-12 mb-4">
						{name}
					</h1>
					<Flag className="w-32 h-24 rounded-md shadow-xl mb-4" countryCode={country} />
				</div>
				<div className="font-kh">
					<p> Round {round}</p>
					<p> {venue}</p>
					<p> {raceDate}</p>
					{isUpcoming && <Countdown date={date} className="p-12 md:p-20" />}
				</div>
			</div>
		</motion.div>
	);
}
