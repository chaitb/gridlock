import { Hono } from "hono";
import { logger } from "hono/logger";
import { requireAuth } from "./middleware/auth";
import { createAccount } from "./routes/create-account";
import { getLeaguePredictions } from "./routes/league-predictions";
import { leaderboard } from "./routes/leaderboard";
import { lockPredictionRoute } from "./routes/lock-prediction";
import { login } from "./routes/login";
import { logout } from "./routes/logout";
import { getMe } from "./routes/me";
import { getUserPredictions } from "./routes/my-predictions";
import { getPredictions, savePredictions } from "./routes/predictions";
import { updateProfile } from "./routes/profile";
import { verifyMagicLink } from "./routes/verify";
import { handleScheduled } from "./scheduled";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();
app.use(logger());

// ── Public routes (no auth required) ────────────────────────────────────────
app.post("/api/login", login);
app.post("/api/create-account", createAccount);
app.get("/api/verify", verifyMagicLink);
app.post("/api/logout", logout);
app.get("/api/leaderboard", leaderboard);

// ── Protected routes (session cookie required) ───────────────────────────────
app.use("/api/me", requireAuth);
app.use("/api/predictions", requireAuth);
app.use("/api/predictions/lock", requireAuth);
app.use("/api/user-predictions", requireAuth);
app.use("/api/league-predictions", requireAuth);
app.use("/api/profile", requireAuth);

app.get("/api/me", getMe);
app.patch("/api/profile", updateProfile);
app.get("/api/predictions", getPredictions);
app.post("/api/predictions", savePredictions);
app.post("/api/predictions/lock", lockPredictionRoute);
app.get("/api/user-predictions", getUserPredictions);
app.get("/api/league-predictions", getLeaguePredictions);

export default {
	fetch: app.fetch,
	scheduled: async (event: ScheduledEvent, env: AppEnv["Bindings"], ctx: ExecutionContext) => {
		ctx.waitUntil(handleScheduled(event, env));
	},
};
