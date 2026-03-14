import { motion } from "framer-motion";
import { Link } from "wouter";
import { DriverCardFull } from "@/App/Drivers";
import { type Constructor, DRIVERS } from "@/App/driver";
import { AppLayout } from "@/App/Layout";

const CONSTRUCTORS_RANKS_2025: Record<Constructor, number> = {
	McLaren: 1,
	Mercedes: 2,
	"Red Bull Racing": 3,
	Ferrari: 4,
	Williams: 5,
	"Racing Bulls": 6,
	"Aston Martin": 7,
	"Haas F1 Team": 8,
	Audi: 9,
	Alpine: 10,
	Cadillac: 11,
};

const container = {
	hidden: {},
	show: { transition: { staggerChildren: 0.05 } },
};

const item = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function DriversStandings() {
	const sortedDrivers = [...DRIVERS].sort(
		(a, b) => CONSTRUCTORS_RANKS_2025[a.team_name] - CONSTRUCTORS_RANKS_2025[b.team_name]
	);

	return (
		<AppLayout headline="2026 Drivers">
			<motion.div
				variants={container}
				initial="hidden"
				animate="show"
				className="mx-3 grid grid-cols-2 lg:grid-cols-4 gap-4"
			>
				{sortedDrivers.map((driver) => (
					<motion.div key={driver.acronym} variants={item}>
						<Link to={`/season/2026/${driver.acronym}`}>
							<DriverCardFull driver={driver} className="w-full" />
						</Link>
					</motion.div>
				))}
			</motion.div>
		</AppLayout>
	);
}
