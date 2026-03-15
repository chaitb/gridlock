import { z } from "zod";

export const emailSchema = z.string().email().trim();

export const loginSchema = z.object({
	email: emailSchema,
});

export const createAccountSchema = z.object({
	username: z.string().trim().min(1),
	email: emailSchema,
});

export const updateProfileSchema = z.object({
	username: z.string().trim().min(1),
});

export const userSchema = z.object({
	id: z.number(),
	username: z.string().nullable(),
	email: z.string(),
	created_at: z.string(),
	verified_at: z.string().nullable(),
	updated_at: z.string(),
	deleted_at: z.string().nullable(),
	preferences: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;
