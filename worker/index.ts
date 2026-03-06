import type { D1Database } from "@cloudflare/workers-types";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { createAccount } from "./routes/create-account";
import { getPredictions, savePredictions } from "./routes/predictions";
import { leaderboard } from "./routes/leaderboard";
import { login } from "./routes/login";
import { updateProfile } from "./routes/profile";

type Bindings = {
	F1_PREDICTIONS: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use(logger());

app.post("/api/login", login);
app.post("/api/create-account", createAccount);
app.get("/api/leaderboard", leaderboard);
app.patch("/api/profile", updateProfile);
app.get("/api/predictions", getPredictions);
app.post("/api/predictions", savePredictions);

export default app;
