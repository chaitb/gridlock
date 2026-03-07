export function getRelativeTime(saved_at: Date, now: Date = new Date()): string {
	const minsAgo = Math.floor((now.getTime() - saved_at.getTime()) / 60_000);
	if (!Number.isFinite(minsAgo) || minsAgo < 1) {
		return "just now";
	}
	if (minsAgo < 60) {
		return `${minsAgo} min${minsAgo === 1 ? "" : "s"} ago`;
	}
	if (minsAgo < 1440) {
		return `${Math.floor(minsAgo / 60)} hour${minsAgo / 60 === 1 ? "" : "s"} ago`;
	}
	return `${Math.floor(minsAgo / 1440)} day${minsAgo / 1440 === 1 ? "" : "s"} ago`;
}
