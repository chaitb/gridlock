const DEFAULT_RETRIES = 3;
const DEFAULT_DELAY_MS = 5000;

export async function withRetry<T>(
	fn: () => Promise<T>,
	options?: { retries?: number; delayMs?: number }
): Promise<T> {
	const retries = options?.retries ?? DEFAULT_RETRIES;
	const delayMs = options?.delayMs ?? DEFAULT_DELAY_MS;

	let lastError: unknown;

	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			if (attempt < retries) {
				console.log(`[retry] attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
				await sleep(delayMs);
			}
		}
	}

	throw lastError;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
