import { Link } from "wouter";
import { AppLayout } from "../Layout";

export function MyTeam() {
	return (
		<AppLayout>
			<p className="mt-8 text-sm text-muted-foreground">
				<Link to="/season" className="hover:underline">
					Season
				</Link>
				{" / "}My Team
			</p>
			<h1 className="mt-2 mb-2 text-3xl font-medium tracking-tight">My Team</h1>
			<p className="text-muted-foreground">Coming soon.</p>
		</AppLayout>
	);
}
