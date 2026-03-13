import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function safeJsonParse(jsonString: string): unknown {
	try {
		return JSON.parse(jsonString);
	} catch {
		console.error("Failed to parse JSON:", jsonString);
		return undefined;
	}
}
