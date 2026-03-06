import { createContext, useContext } from "react";
import type { User } from "@/model";

type UserContextType = {
	user: User | null;
	login: (user: User) => void;
	logout: () => void;
	isLoading: boolean;
};

export const UserContext = createContext<UserContextType | null>(null);

export function useUser() {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
}
