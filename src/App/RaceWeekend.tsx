import { motion } from "framer-motion";
import { Link } from "wouter";
import { type CountryCode, Flag } from "@/components/flags";
import { cn } from "@/lib/utils";
import { AppLayout } from "./Layout";

export type RaceCode =
	| "aus"
	| "china"
	| "jpn"
	| "bahrain"
	| "saudi"
	| "miami"
	| "canada"
	| "monaco"
	| "barcelona"
	| "austria"
	| "british"
	| "belgian"
	| "hungarian"
	| "dutch"
	| "italian"
	| "spanish"
	| "azerbaijan"
	| "singapore"
	| "us"
	| "mexico"
	| "brazil"
	| "vegas"
	| "qatar"
	| "abu-dhabi";

type Race = {
	round: number;
	code: RaceCode;
	country: CountryCode;
	name: string;
	venue: string;
	date: Date;
	sprint: boolean;
};

export const RACES_2026: Race[] = [
	{
		round: 1,
		code: "aus",
		country: "au",
		name: "Australian Grand Prix",
		venue: "Albert Park, Melbourne",
		date: new Date("March 8, 2026"),
		sprint: false,
	},
	{
		round: 2,
		code: "china",
		country: "cn",
		name: "Chinese Grand Prix",
		venue: "Shanghai International Circuit",
		date: new Date("March 15, 2026"),
		sprint: true,
	},
	{
		round: 3,
		code: "jpn",
		country: "jp",
		name: "Japanese Grand Prix",
		venue: "Suzuka Circuit",
		date: new Date("March 29, 2026"),
		sprint: false,
	},
	{
		round: 4,
		code: "bahrain",
		country: "bh",
		name: "Bahrain Grand Prix",
		venue: "Bahrain International Circuit, Sakhir",
		date: new Date("April 12, 2026"),
		sprint: false,
	},
	{
		round: 5,
		code: "saudi",
		country: "sa",
		name: "Saudi Arabian Grand Prix",
		venue: "Jeddah Corniche Circuit",
		date: new Date("April 19, 2026"),
		sprint: false,
	},
	{
		round: 6,
		code: "miami",
		country: "us",
		name: "Miami Grand Prix",
		venue: "Miami International Autodrome",
		date: new Date("May 3, 2026"),
		sprint: true,
	},
	{
		round: 7,
		code: "canada",
		country: "ca",
		name: "Canadian Grand Prix",
		venue: "Circuit Gilles Villeneuve, Montreal",
		date: new Date("May 24, 2026"),
		sprint: true,
	},
	{
		round: 8,
		code: "monaco",
		country: "mc",
		name: "Monaco Grand Prix",
		venue: "Circuit de Monaco, Monte Carlo",
		date: new Date("June 7, 2026"),
		sprint: false,
	},
	{
		round: 9,
		code: "barcelona",
		country: "es",
		name: "Barcelona-Catalunya GP",
		venue: "Circuit de Barcelona-Catalunya",
		date: new Date("June 14, 2026"),
		sprint: false,
	},
	{
		round: 10,
		code: "austria",
		country: "at",
		name: "Austrian Grand Prix",
		venue: "Red Bull Ring, Spielberg",
		date: new Date("June 28, 2026"),
		sprint: false,
	},
	{
		round: 11,
		code: "british",
		country: "gb",
		name: "British Grand Prix",
		venue: "Silverstone Circuit",
		date: new Date("July 5, 2026"),
		sprint: true,
	},
	{
		round: 12,
		code: "belgian",
		country: "be",
		name: "Belgian Grand Prix",
		venue: "Circuit de Spa-Francorchamps",
		date: new Date("July 19, 2026"),
		sprint: false,
	},
	{
		round: 13,
		code: "hungarian",
		country: "hu",
		name: "Hungarian Grand Prix",
		venue: "Hungaroring, Budapest",
		date: new Date("July 26, 2026"),
		sprint: false,
	},
	{
		round: 14,
		code: "dutch",
		country: "nl",
		name: "Dutch Grand Prix",
		venue: "Circuit Zandvoort",
		date: new Date("August 23, 2026"),
		sprint: true,
	},
	{
		round: 15,
		code: "italian",
		country: "it",
		name: "Italian Grand Prix",
		venue: "Autodromo Nazionale Monza",
		date: new Date("September 6, 2026"),
		sprint: false,
	},
	{
		round: 16,
		code: "spanish",
		country: "es",
		name: "Spanish Grand Prix",
		venue: "Madrid Street Circuit (IFEMA)",
		date: new Date("September 13, 2026"),
		sprint: false,
	},
	{
		round: 17,
		code: "azerbaijan",
		country: "az",
		name: "Azerbaijan Grand Prix",
		venue: "Baku City Circuit",
		date: new Date("September 26, 2026"),
		sprint: false,
	},
	{
		round: 18,
		code: "singapore",
		country: "sg",
		name: "Singapore Grand Prix",
		venue: "Marina Bay Street Circuit",
		date: new Date("October 11, 2026"),
		sprint: true,
	},
	{
		round: 19,
		code: "us",
		country: "us",
		name: "United States Grand Prix",
		venue: "Circuit of the Americas, Austin",
		date: new Date("October 25, 2026"),
		sprint: false,
	},
	{
		round: 20,
		code: "mexico",
		country: "mx",
		name: "Mexico City Grand Prix",
		venue: "Autódromo Hermanos Rodríguez",
		date: new Date("November 1, 2026"),
		sprint: false,
	},
	{
		round: 21,
		code: "brazil",
		country: "br",
		name: "São Paulo Grand Prix",
		venue: "Interlagos, São Paulo",
		date: new Date("November 8, 2026"),
		sprint: false,
	},
	{
		round: 22,
		code: "vegas",
		country: "us",
		name: "Las Vegas Grand Prix",
		venue: "Las Vegas Strip Circuit",
		date: new Date("November 21, 2026"),
		sprint: false,
	},
	{
		round: 23,
		code: "qatar",
		country: "qa",
		name: "Qatar Grand Prix",
		venue: "Lusail International Circuit",
		date: new Date("November 29, 2026"),
		sprint: false,
	},
	{
		round: 24,
		code: "abu-dhabi",
		country: "ae",
		name: "Abu Dhabi Grand Prix",
		venue: "Yas Marina Circuit",
		date: new Date("December 6, 2026"),
		sprint: false,
	},
];

const container = {
	hidden: {},
	show: { transition: { staggerChildren: 0.05 } },
};

const item = {
	hidden: { opacity: 0, y: 8 },
	show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function RaceWeekend() {
	const today = new Date();
	const races = RACES_2026.map((race) => {
		return { ...race, isUpcoming: new Date(race.date) >= today };
	});
	const nextRace = races.find((race) => race.isUpcoming);
	return (
		<AppLayout headline="Race Calendar">
			<motion.ul
				variants={container}
				initial="hidden"
				animate="show"
				className="flex flex-col divide-y divide-border"
			>
				{races.map((race) => (
					<motion.li key={race.round} variants={item}>
						<Link
							to={`/race/${race.code}`}
							className="flex items-baseline gap-4 p-3 hover:text-muted-foreground transition-colors duration-200 hover:bg-secondary"
						>
							<span className="w-6 shrink-0 text-xl md:text-4xl font-thin text-muted-foreground tabular-nums mr-4">
								{race.round.toString().padStart(2, "0")}
							</span>
							<Flag
								className="size-5 md:size-7 border-border scale-95 translate-y-0.5 rounded-full object-cover shadow-sm"
								countryCode={race.country}
							/>
							<div
								className={cn("font-medium text-xl md:text-4xl", {
									"text-accent-foreground": race.round === nextRace?.round,
									"text-muted-foreground": !race.isUpcoming,
								})}
							>
								{race.name}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm text-muted-foreground truncate font-thin">{race.venue}</p>
							</div>
							<span className="shrink-0 text-xl md:text-2xl font-thin text-muted-foreground">
								{race.date.toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								})}
							</span>
						</Link>
					</motion.li>
				))}
			</motion.ul>
		</AppLayout>
	);
}
