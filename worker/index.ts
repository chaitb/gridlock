import { Hono } from "hono";
import { logger } from "hono/logger";
import { requireAuth } from "./middleware/auth";
import { adminAction, adminGetUsers } from "./routes/admin";
import { createAccount } from "./routes/create-account";
import { getDriverResults } from "./routes/driver-results";
import { leaderboard } from "./routes/leaderboard";
import { getLeaguePredictions } from "./routes/league-predictions";
import { lockPredictionRoute } from "./routes/lock-prediction";
import { login } from "./routes/login";
import { logout } from "./routes/logout";
import { getMe } from "./routes/me";
import { getUserPredictions } from "./routes/my-predictions";
import { getPredictions, savePredictions } from "./routes/predictions";
import { updateProfile } from "./routes/profile";
import {
	adminScoreRace,
	getMyRaceScore,
	getRaceScores,
	getSeasonScoresRoute,
} from "./routes/scoreRoutes";
import { getSessionResults } from "./routes/session-results";
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
app.get("/api/session-results", getSessionResults);
app.get("/api/driver-results", getDriverResults);
app.get("/api/scores", getRaceScores);
app.get("/api/scores/season", getSeasonScoresRoute);

// ── Protected routes (session cookie required) ───────────────────────────────
app.use("/api/me", requireAuth);
app.use("/api/predictions", requireAuth);
app.use("/api/predictions/lock", requireAuth);
app.use("/api/user-predictions", requireAuth);
app.use("/api/league-predictions", requireAuth);
app.use("/api/profile", requireAuth);
app.use("/api/scores/me", requireAuth);
app.use("/api/admin/*", requireAuth);

app.get("/api/me", getMe);
app.patch("/api/profile", updateProfile);
app.get("/api/predictions", getPredictions);
app.post("/api/predictions", savePredictions);
app.post("/api/predictions/lock", lockPredictionRoute);
app.get("/api/user-predictions", getUserPredictions);
app.get("/api/league-predictions", getLeaguePredictions);
app.get("/api/scores/me", getMyRaceScore);
app.post("/api/admin", adminAction);
app.get("/api/admin/users", adminGetUsers);
app.post("/api/admin/score", adminScoreRace);

export default {
	fetch: app.fetch,
	scheduled: async (event: ScheduledEvent, env: AppEnv["Bindings"], ctx: ExecutionContext) => {
		ctx.waitUntil(handleScheduled(event, env));
	},
};
