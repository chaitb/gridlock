import { useLocation } from "wouter";
import { useUser } from "@/context/useUser";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { user, isLoading } = useUser();
	const [, navigate] = useLocation();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				Loading...
			</div>
		);
	}

	if (!user) {
		navigate("/login");
		return null;
	}

	return <>{children}</>;
}
