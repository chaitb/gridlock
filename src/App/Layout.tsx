// Navigation imports kept for future use

import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

// import { NavigationMenu, ... } from "@/components/ui/navigation-menu";

import { useEffect } from "react";
import { Link } from "wouter";

export const AppLayout = ({
	headline,
	children,
	wide = false,
}: {
	headline?: string;
	children: React.ReactNode;
	wide?: boolean;
}) => {
	useEffect(() => {
		if (headline && headline !== "GridLock 2026") {
			document.title = `GridLock - ${headline}`;
		} else {
			document.title = "GridLock 2026";
		}
	}, [headline]);
	return (
		<div className={`mx-auto mt-20 mb-20 ${wide ? "max-w-screen-3xl px-12" : "container"}`}>
			{/*<RacingStripe />*/}
			{headline && (
				<div className="flex justify-between items-center mx-3 mb-4 font-audiowide uppercase">
					<Link
						href="/home"
						className="text-3xl md:text-5xl text-primary hover:text-muted-foreground transition-colors duration-300"
					>
						<motion.h1
							key="headline"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.2 }}
						>
							{headline}
						</motion.h1>
					</Link>
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.2 }}
					>
						<ThemeToggle />
					</motion.div>
				</div>
			)}

			{/*<NavigationMenu className="mx-auto mt-2">
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuLink
							href="/rules"
							className={navigationMenuTriggerStyle()}
						>
							Rules
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink
							href="/"
							className={navigationMenuTriggerStyle()}
						>
							Race Weekend
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink
							href="/"
							className={navigationMenuTriggerStyle()}
						>
							Profile
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<ThemeToggle />
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>*/}
			{children}
		</div>
	);
};

export const RacingStripe = () => {
	return (
		<div className="fixed right-20 top-0 h-full flex gap-1 -z-50 pointer-events-none">
			{/* Secondary thin accent stripe */}
			<motion.div
				initial={{ height: 0 }}
				animate={{ height: "100vh" }}
				transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
				className="w-4 bg-accent-foreground"
			/>
			{/* Main thick stripe */}
			<motion.div
				initial={{ height: 0 }}
				animate={{ height: "100vh" }}
				transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // Fast, sleek easing
				className="w-20 bg-accent-foreground"
			/>
		</div>
	);
};
