import { Link } from "wouter";
import { AppLayout } from "../Layout";

export function Wcc() {
	return (
		<AppLayout>
			<p className="mt-8 text-sm text-muted-foreground">
				<Link to="/season" className="hover:underline">
					Season
				</Link>
				{" / "}WCC
			</p>
			<h1 className="mt-2 mb-2 text-3xl font-medium tracking-tight">
				World Constructors' Championship
			</h1>
			<p className="text-muted-foreground">Coming soon.</p>
		</AppLayout>
	);
}
