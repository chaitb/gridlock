import type { D1Database } from "@cloudflare/workers-types";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { createAccount } from "./routes/create-account";
import { getPredictions, savePredictions } from "./routes/predictions";
import { getUserPredictions } from "./routes/my-predictions";
import { getLeaguePredictions } from "./routes/league-predictions";
import { lockPredictionRoute } from "./routes/lock-prediction";
import { leaderboard } from "./routes/leaderboard";
import { login } from "./routes/login";
import { updateProfile } from "./routes/profile";
import { handleScheduled } from "./scheduled";

type Bindings = {
	F1_PREDICTIONS: D1Database;
	RESEND_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use(logger());

app.post("/api/login", login);
app.post("/api/create-account", createAccount);
app.get("/api/leaderboard", leaderboard);
app.patch("/api/profile", updateProfile);
app.get("/api/predictions", getPredictions);
app.post("/api/predictions", savePredictions);
app.post("/api/predictions/lock", lockPredictionRoute);
app.get("/api/user-predictions", getUserPredictions);
app.get("/api/league-predictions", getLeaguePredictions);

export default {
	fetch: app.fetch,
	scheduled: async (event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) => {
		ctx.waitUntil(handleScheduled(event, env));
	},
};
