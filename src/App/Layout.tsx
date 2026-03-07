// Navigation imports kept for future use
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
