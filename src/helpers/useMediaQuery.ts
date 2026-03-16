import { useEffect, useState } from "react";

export function useMediaQuery(minWidth: number): boolean;
export function useMediaQuery(
	minWidth: number,
	containerRef: React.RefObject<HTMLElement | null>
): boolean;
export function useMediaQuery(
	minWidth: number,
	containerRef?: React.RefObject<HTMLElement | null>
): boolean {
	const [matches, setMatches] = useState(() => {
		if (containerRef?.current) {
			return containerRef.current.offsetWidth >= minWidth;
		}
		return typeof window !== "undefined"
			? window.matchMedia(`(min-width: ${minWidth}px)`).matches
			: false;
	});

	useEffect(() => {
		if (containerRef?.current) {
			const element = containerRef.current;
			const observer = new ResizeObserver((entries) => {
				for (const entry of entries) {
					setMatches(entry.contentRect.width >= minWidth);
				}
			});
			observer.observe(element);
			setMatches(element.offsetWidth >= minWidth);
			return () => observer.disconnect();
		}

		const mql = window.matchMedia(`(min-width: ${minWidth}px)`);
		const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
		setMatches(mql.matches);
		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	}, [minWidth, containerRef]);

	return matches;
}
