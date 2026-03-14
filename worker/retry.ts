import { err, ok, type Result } from "../src/shared/Result";

const DEFAULT_RETRIES = 3;
const DEFAULT_DELAY_MS = 5000;

export async function withRetry<T>(
	fn: () => Promise<T>,
	options?: { retries?: number; delayMs?: number }
): Promise<Result<T, Error>> {
	const retries = options?.retries ?? DEFAULT_RETRIES;
	const delayMs = options?.delayMs ?? DEFAULT_DELAY_MS;

	let lastError: Error = new Error("Unknown error");

	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			return ok(await fn());
		} catch (e) {
			lastError = e instanceof Error ? e : new Error(String(e));
			if (attempt < retries) {
				console.log(`[retry] attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
				await sleep(delayMs);
			}
		}
	}

	return err(lastError);
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
