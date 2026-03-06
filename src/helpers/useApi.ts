import { useUser } from "@/context/useUser";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useApi<T>(url: string, options?: { params?: Record<string, string | number> }) {
	const { user } = useUser();
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<unknown>(null);
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

	const fetchData = useCallback(() => {
		setIsLoading(true);
		fetch(fullUrl)
			.then((res) => res.json())
			.then((data) => {
				setData(data);
				setIsLoading(false);
			})
			.catch((error) => {
				setError(error);
				setIsLoading(false);
			});
	}, [fullUrl]);

	useEffect(() => {
		fetchData();
	}, [fetchData, fullUrl, refetchKey]);

	const refetch = useCallback(() => {
		setRefetchKey((k) => k + 1);
	}, []);

	return { data, error, isLoading, refetch };
}
