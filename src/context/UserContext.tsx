import { useEffect, useMemo, useState } from "react";
import { UserContext } from "./useUser";
import type { User } from "@/model";

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// On mount, hydrate the session from the HTTP-only cookie via /api/me.
	// This is the only source of truth — no localStorage involved.
	useEffect(() => {
		fetch("/api/me")
			.then(async (res) => {
				if (!res.ok) {
					setUser(null);
					return;
				}
				const body = (await res.json()) as { user: User };
				setUser(body.user);
			})
			.catch(() => setUser(null))
			.finally(() => setIsLoading(false));
	}, []);

	// Called by the /verify page after the worker sets the session cookie.
	// The cookie is already set server-side; we just update local state here.
	const login = useMemo(
		() => (userData: User) => {
			setUser(userData);
		},
		[]
	);

	// Clears the session cookie server-side and wipes local state.
	const logout = useMemo(
		() => () => {
			fetch("/api/logout", { method: "POST" }).catch(() => {});
			setUser(null);
		},
		[]
	);

	const value = useMemo(
		() => ({ user, login, logout, isLoading }),
		[user, login, logout, isLoading]
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
