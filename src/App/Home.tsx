import { motion } from "framer-motion";
import { Link } from "wouter";
import { AppLayout } from "./Layout";
import { useUser } from "@/context/useUser";
import { useMemo } from "react";

export function UserHome() {
	const { user } = useUser();
	const LINKS = useMemo(
		() => [
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
			// {
			// 	title: "League Predictions",
			// 	path: "/league",
			// },
			{
				title: "My Predictions",
				path: user?.username ? `/${user.username}/predictions` : "/my-predictions",
			},
			{
				title: user?.username ? (
					<p className="text-primary group-hover:text-accent-foreground transition-colors duration-300">
						<span className="text-md text-muted-foreground/60 group-hover:text-accent-foreground transition-colors duration-300">
							@
						</span>
						{user.username}
					</p>
				) : (
					"Profile"
				),
				path: "/profile",
			},
		],
		[user]
	);
	return (
		<AppLayout headline="GridLock">
			{LINKS.map((l, i) => (
				<motion.div
					key={l.path}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: i * 0.12 }}
					className="mb-2"
				>
					<Link to={l.path}>
						<h1 className="ml-3 mt-2 scroll-m-20 text-left text-4xl font-medium tracking-tight text-balance hover:text-accent-foreground transition-colors duration-300 group">
							{l.title}
						</h1>
					</Link>
				</motion.div>
			))}
		</AppLayout>
	);
}
