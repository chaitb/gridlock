import { motion } from "framer-motion";
import type { FormEvent } from "react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import poster from "./assets/GridLock2026.webp";
import { Badge } from "./components/ui/badge";

const BetaBadge = () => {
	return (
		<Badge
			variant="secondary"
			className="text-xxs pt-1 uppercase tracking-[0.3em] text-muted-foreground"
		>
			Beta
		</Badge>
	);
};

type FormStatus = "idle" | "loading" | "sent" | "error";

type FormState = {
	status: FormStatus;
	message: string;
};

const feedbackClass = (state: FormState) => {
	if (state.status === "sent") return "text-emerald-400";
	if (state.status === "error") return "text-rose-400";
	return "text-muted-foreground";
};

const sendRequest = async (url: string, body: Record<string, string>) => {
	const response = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	const payload = await response.json();
	if (!response.ok) {
		const err = new Error(
			(payload as { message?: string })?.message || "Request failed"
		) as Error & {
			status: number;
		};
		err.status = response.status;
		throw err;
	}
	return payload;
};

// ── Shared layout ────────────────────────────────────────────────────────────

function AuthShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
			<div
				className="absolute inset-0 bg-cover bg-center scale-110"
				style={{
					backgroundImage: `url(${poster})`,
					filter: "blur(1px) brightness(0.85)",
				}}
			/>
			<div className="texture-bg absolute inset-0 pointer-events-none" />
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className="m-1 bg-background/80 backdrop-blur-sm p-12 rounded-lg relative z-10 w-full max-w-md px-4"
			>
				{children}
			</motion.div>
		</div>
	);
}

// ── Submit button ────────────────────────────────────────────────────────────

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
	return (
		<motion.button
			type="submit"
			disabled={loading}
			whileTap={{ scale: 0.97 }}
			className="w-full mt-2 py-2.5 rounded-md bg-accent-foreground text-white font-medium text-sm tracking-wide disabled:opacity-50 transition-opacity"
		>
			{loading ? "…" : label}
		</motion.button>
	);
}

// ── "Check your inbox" confirmation ─────────────────────────────────────────

function InboxConfirmation({ email }: { email: string }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="space-y-3"
		>
			<h1 className="text-3xl font-audiowide uppercase font-medium tracking-tight text-emerald-400">
				Check your email
			</h1>
			<p className="text-sm text-muted-foreground leading-relaxed">
				We sent a login link to <span className="text-foreground">{email}</span>. It expires in{" "}
				<strong className="text-foreground">15 minutes</strong>.
			</p>
			<p className="text-xs text-muted-foreground/60">
				Didn't receive it? Check your spam folder or request a new link.
			</p>
		</motion.div>
	);
}

// ── Login page ───────────────────────────────────────────────────────────────

export function Login() {
	const [email, setEmail] = useState("");
	const [state, setState] = useState<FormState>({ status: "idle", message: "" });
	const [, navigate] = useLocation();

	const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setState({ status: "loading", message: "" });
		try {
			await sendRequest("/api/login", { email: email.trim() });
			setState({ status: "sent", message: "" });
		} catch (error) {
			const status = (error as { status?: number }).status;
			setState({
				status: "error",
				message:
					status === 404
						? "No account found for that email."
						: error instanceof Error
							? error.message
							: "Unexpected error",
			});
		}
	};

	if (state.status === "sent") {
		return (
			<AuthShell>
				<p className="font-kh text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
					GridLock 2026 <BetaBadge />
				</p>
				<InboxConfirmation email={email} />
			</AuthShell>
		);
	}

	return (
		<AuthShell>
			<p className="font-kh text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
				GridLock 2026 <BetaBadge />
			</p>
			<h1 className="text-4xl font-audiowide uppercase font-medium tracking-tight mb-8">Log in</h1>

			<form onSubmit={handleLogin} autoComplete="email">
				<FieldSet className="w-full">
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="login-email">Email</FieldLabel>
							<Input
								id="login-email"
								type="email"
								placeholder="you@email.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={state.status === "loading"}
								required
							/>
						</Field>
					</FieldGroup>
				</FieldSet>
				<SubmitButton loading={state.status === "loading"} label="Send login link" />
			</form>

			{state.message && (
				<motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
					<p className={`text-sm leading-snug ${feedbackClass(state)}`}>{state.message}</p>
					{state.status === "error" && state.message.includes("No account") && (
						<button
							type="button"
							onClick={() => navigate("/signup")}
							className="mt-1 text-sm underline underline-offset-2 text-accent-foreground"
						>
							Create an account instead →
						</button>
					)}
				</motion.div>
			)}

			<p className="mt-8 text-xs text-muted-foreground/60">
				No account?{" "}
				<button
					type="button"
					onClick={() => navigate("/signup")}
					className="text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
				>
					Create one
				</button>
			</p>
		</AuthShell>
	);
}

// ── Create account page ──────────────────────────────────────────────────────

export function CreateAccount() {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [state, setState] = useState<FormState>({ status: "idle", message: "" });
	const [, navigate] = useLocation();

	const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setState({ status: "loading", message: "" });
		try {
			await sendRequest("/api/create-account", {
				email: email.trim(),
				username: username.trim(),
			});
			setState({ status: "sent", message: "" });
		} catch (error) {
			setState({
				status: "error",
				message: error instanceof Error ? error.message : "Unexpected error",
			});
		}
	};

	const disabled = state.status === "loading" || state.status === "sent";

	if (state.status === "sent") {
		return (
			<AuthShell>
				<p className="font-kh text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
					GridLock 2026 <BetaBadge />
				</p>
				<InboxConfirmation email={email} />
			</AuthShell>
		);
	}

	return (
		<AuthShell>
			<p className="font-kh text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
				GridLock 2026 <BetaBadge />
			</p>
			<h1 className="text-4xl font-audiowide uppercase font-medium tracking-tight mb-8">
				Create account
			</h1>

			<form onSubmit={handleCreate} autoComplete="off">
				<FieldSet className="w-full">
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="create-username">Username</FieldLabel>
							<Input
								id="create-username"
								type="text"
								placeholder="verstappen"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								disabled={disabled}
								required
							/>
							<FieldDescription>Pick a unique name for the leaderboard.</FieldDescription>
						</Field>
						<Field>
							<FieldLabel htmlFor="create-email">Email</FieldLabel>
							<Input
								id="create-email"
								type="email"
								placeholder="you@email.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={disabled}
								required
							/>
							<FieldDescription>Used to log in — never shared.</FieldDescription>
						</Field>
					</FieldGroup>
				</FieldSet>
				<SubmitButton loading={state.status === "loading"} label="Create account" />
			</form>

			{state.message && (
				<motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
					<p className={`text-sm leading-snug ${feedbackClass(state)}`}>{state.message}</p>
				</motion.div>
			)}

			<p className="mt-8 text-xs text-muted-foreground/60">
				Already have an account?{" "}
				<button
					type="button"
					onClick={() => navigate("/login")}
					className="text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
				>
					Log in
				</button>
			</p>
		</AuthShell>
	);
}
