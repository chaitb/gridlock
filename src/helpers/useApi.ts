import { useUser } from "@/context/useUser";
import { useCallback, useEffect, useMemo, useState } from "react";

export class ApiError extends Error {
	readonly status: number;
	readonly body: unknown;

	constructor(message: string, status: number, body: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.body = body;
	}

	public toString(): string {
		return `ApiError: ${this.message} (status: ${this.status}, body: ${JSON.stringify(this.body)})`;
	}

	public getBody(): unknown {
		return this.body;
	}
}

export function useApi<T>(url: string, options?: { params?: Record<string, string | number> }) {
	const { user } = useUser();
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<ApiError | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [refetchKey, setRefetchKey] = useState(0);

	const fullUrl = useMemo((): string => {
		let full: URL;
		if (url.startsWith("/api") && user?.username) {
			full = new URL(window.location.href);
			full.pathname = url;
			full.searchParams.set("userId", user.username);
		} else {
			full = new URL(url);
		}

		if (options?.params) {
			for (const [key, value] of Object.entries(options.params)) {
				full.searchParams.set(key, String(value));
			}
		}
		return full.toString();
	}, [url, user, options]);

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch(fullUrl);
			if (!res.ok) {
				let body: unknown = null;
				try {
					body = await res.json();
				} catch {
					// non-JSON error body — leave as null
				}
				throw new ApiError(`Request failed: ${res.status} ${res.statusText}`, res.status, body);
			}
			const json = await res.json();
			setData(json as T);
		} catch (err) {
			console.error("[useApi] fetch error", err);
			setError(
				err instanceof ApiError
					? err
					: new ApiError(err instanceof Error ? err.message : String(err), 0, undefined)
			);
		} finally {
			setIsLoading(false);
		}
	}, [fullUrl]);

	useEffect(() => {
		fetchData();
	}, [fetchData, refetchKey]);

	const refetch = useCallback(() => {
		setRefetchKey((k) => k + 1);
	}, []);

	return { data, error, isLoading, refetch };
}
