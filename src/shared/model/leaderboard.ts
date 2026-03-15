import { z } from "zod";

export const leaderboardEntrySchema = z.object({
	rank: z.number(),
	username: z.string(),
	points: z.number(),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
