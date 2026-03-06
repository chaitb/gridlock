import { motion } from "framer-motion";
import { Link } from "wouter";
import { AppLayout } from "./Layout";

const links = [
	{
		title: "Races",
		path: "/race",
	},
	{
		title: "2026 Season Predictions",
		path: "/season",
	},
	{
		title: "Rules",
		path: "/rules",
	},
	{
		title: "Leaderboard",
		path: "/leaderboard",
	},
	{
		title: "Profile",
		path: "/profile",
	},
];

export function UserHome() {
	return (
		<AppLayout headline="F1 Predictions">
			{links.map((l, i) => (
				<motion.div
					key={l.path}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: i * 0.12 }}
				>
					<Link to={l.path}>
						<h1 className="ml-3 mt-2 scroll-m-20 text-left text-4xl font-medium tracking-tight text-balance hover:text-accent-foreground transition-colors duration-300">
							{l.title}
						</h1>
					</Link>
				</motion.div>
			))}
		</AppLayout>
	);
}
