import { useMemo, useState } from "react";
import { UserContext } from "./useUser";
import type { User } from "@/model";

function getInitialUser(): User | null {
	if (typeof window === "undefined") return null;
	try {
		const stored = localStorage.getItem("user");
		return stored ? JSON.parse(stored) : null;
	} catch {
		localStorage.removeItem("user");
		return null;
	}
}

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(getInitialUser);
	const [isLoading] = useState(false);

	const login = useMemo(
		() => (userData: User) => {
			setUser(userData);
			localStorage.setItem("user", JSON.stringify(userData));
		},
		[]
	);

	const logout = useMemo(
		() => () => {
			setUser(null);
			localStorage.removeItem("user");
		},
		[]
	);

	const value = useMemo(
		() => ({ user, login, logout, isLoading }),
		[user, login, logout, isLoading]
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
