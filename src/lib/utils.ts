import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function safeJsonParse<T>(jsonString: string): T | undefined {
	try {
		return JSON.parse(jsonString) as T;
	} catch {
		console.error("Failed to parse JSON:", jsonString);
		return undefined;
	}
}
