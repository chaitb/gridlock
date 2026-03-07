import { motion } from "framer-motion";
import { Link } from "wouter";
import { AppLayout } from "./Layout";

const sublinks = [
	{
		title: "Race Predictions",
		path: "/race",
		description: "Predictions for each race",
	},
	{
		title: "WDC",
		path: "/season/wdc",
		description: "World Drivers' Championship",
	},
	{
		title: "WCC",
		path: "/season/wcc",
		description: "World Constructors' Championship",
	},
	{
		title: "Mid-Season",
		path: "/season/mid-season",
		description: "Mid-season standings update",
	},
	{
		title: "My Team",
		path: "/season/my-team",
		description: "Your personal team predictions",
	},
];

const container = {
	hidden: {},
	show: { transition: { staggerChildren: 0.1 } },
};

const item = {
	hidden: { opacity: 0, y: 10 },
	show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function Season() {
	return (
		<AppLayout>
			<h1 className="mt-8 mb-6 text-3xl font-medium tracking-tight">2026 Season Predictions</h1>
			<motion.ul
				variants={container}
				initial="hidden"
				animate="show"
				className="flex flex-col divide-y divide-border"
			>
				{sublinks.map((l) => (
					<motion.li key={l.path} variants={item}>
						<Link to={l.path}>
							<div className="py-4 group">
								<p className="text-2xl font-medium tracking-tight group-hover:text-muted-foreground transition-colors duration-200">
									{l.title}
								</p>
								<p className="text-sm text-muted-foreground">{l.description}</p>
							</div>
						</Link>
					</motion.li>
				))}
			</motion.ul>
		</AppLayout>
	);
}
