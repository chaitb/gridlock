import type { Context } from "hono";
import { z } from "zod";
import { tryAsync } from "@/shared/Result";
import { getSessionResultsByDriver } from "../queries/sessionResultQueries";
import type { AppEnv } from "../types";

const paramsSchema = z.object({
	driver_number: z.coerce.number().int().positive(),
});

export async function getDriverResults(c: Context<AppEnv>) {
	const { env } = c;

	const driverNumber = c.req.query("driver_number");
	const parsed = paramsSchema.safeParse({ driver_number: driverNumber });

	if (!parsed.success) {
		return c.json({ message: "Invalid request", errors: parsed.error.issues }, 400);
	}

	const { driver_number } = parsed.data;

	const result = await tryAsync(() => getSessionResultsByDriver(env.F1_PREDICTIONS, driver_number));

	if (!result.ok) {
		console.error("[driver-results] error", result.error);
		return c.json({ message: "Failed to fetch driver results" }, 500);
	}

	return c.json(result.value);
}
