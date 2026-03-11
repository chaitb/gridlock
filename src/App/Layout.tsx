// Navigation imports kept for future use

import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
// import { NavigationMenu, ... } from "@/components/ui/navigation-menu";

import { Link } from "wouter";

export const AppLayout = ({
	headline,
	children,
}: {
	headline?: string;
	children: React.ReactNode;
}) => {
	return (
		<div className="container mx-auto mt-20 mb-20">
			{/*<RacingStripe />*/}
			{headline && (
				<h1 className="flex items-center gap-2 ml-3 mb-6 text-4xl font-medium tracking-tight text-muted-foreground">
					<Link href="/home">{headline}</Link>
					<ThemeToggle />
				</h1>
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
