import type { FormEvent } from "react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/useUser";
import poster from "./assets/poster.webp";

type FormState = {
	status: "idle" | "loading" | "success" | "error";
	message: string;
};

const feedbackClass = (state: FormState) => {
	if (state.status === "success") return "text-emerald-400";
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
		throw new Error(payload?.message || "Request failed");
	}
	return payload;
};

const loginInitial: FormState = {
	status: "idle",
	message: "Tell us your email to enter the realm.",
};

const createInitial: FormState = {
	status: "idle",
	message: "Reserve a username and email for your account.",
};

export function Login() {
	const [loginOrCreate, setLoginOrCreate] = useState<"login" | "create">("login");
	return (
		<div className="min-h-screen bg-gradient-to-br from-red-500 via-blue-200 to-green-200 text-slate-50 flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-xl grid gap-6">
				<Card className="bg-background mx-auto">
					<div className="px-5">
						<img className="rounded-md" height={400} width="100%" src={poster} alt="" />
					</div>
					{loginOrCreate === "login" ? <LoginContent /> : <CreateAccountContent />}
					<CardFooter className="text-xs text-slate-500">
						{loginOrCreate === "login" ? (
							<p>
								Don't have an account?{" "}
								<button type="button" onClick={() => setLoginOrCreate("create")}>
									Create one
								</button>
								.
							</p>
						) : (
							<p>
								Already have an account?{" "}
								<button type="button" onClick={() => setLoginOrCreate("login")}>
									Log in
								</button>
								.
							</p>
						)}
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}

function LoginContent() {
	const [loginEmail, setLoginEmail] = useState("");
	const [loginState, setLoginState] = useState<FormState>(loginInitial);
	const [, navigate] = useLocation();
	const { login } = useUser();
	const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoginState({ status: "loading", message: "Checking your email…" });
		try {
			const res = await sendRequest("/api/login", {
				email: loginEmail.trim(),
			});
			setLoginState({
				status: "success",
				message: "Login acknowledged.",
			});
			login(res.user);
			navigate(`/u/${res.user.username}`);
		} catch (error) {
			setLoginState({
				status: "error",
				message: error instanceof Error ? error.message : "Unexpected error",
			});
		}
	};
	return (
		<>
			<CardHeader>
				<CardTitle className="text-3xl">Login</CardTitle>
				<CardDescription className="text-sm text-slate-400">
					Send your email and we will acknowledge your arrival.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleLogin} className="space-y-4" autoComplete="email">
					<div className="space-y-1">
						<Label className="text-xs uppercase tracking-[0.3em] text-slate-400">Email</Label>
						<Input
							type="email"
							placeholder="you@email.com"
							value={loginEmail}
							onChange={(event) => setLoginEmail(event.target.value)}
							disabled={loginState.status === "loading"}
							required
						/>
					</div>
					<Button className="w-full" type="submit" disabled={loginState.status === "loading"}>
						{loginState.status === "loading" ? "Loading…" : "Log in"}
					</Button>
				</form>
				<p className={`mt-3 text-sm ${feedbackClass(loginState)}`}>{loginState.message}</p>
			</CardContent>
		</>
	);
}

function CreateAccountContent() {
	const [createEmail, setCreateEmail] = useState("");
	const [username, setUsername] = useState("");
	const [createState, setCreateState] = useState<FormState>(createInitial);

	const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setCreateState({ status: "loading", message: "Creating the account…" });
		try {
			await sendRequest("/api/create-account", {
				email: createEmail.trim(),
				username: username.trim(),
			});
			setCreateState({ status: "success", message: "Account created." });
		} catch (error) {
			setCreateState({
				status: "error",
				message: error instanceof Error ? error.message : "Unexpected error",
			});
		}
	};
	return (
		<>
			<CardHeader>
				<CardTitle className="text-3xl">Create account</CardTitle>
				<CardDescription className="text-sm text-slate-400">
					Pick a username and email to reserve your full account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleCreate} className="space-y-4" autoComplete="off">
					<div className="space-y-1">
						<Label className="text-xs uppercase tracking-[0.3em] text-slate-400">Username</Label>
						<Input
							type="text"
							placeholder="wanderer"
							value={username}
							onChange={(event) => setUsername(event.target.value)}
							disabled={createState.status === "loading"}
							required
						/>
					</div>
					<div className="space-y-1">
						<Label className="text-xs uppercase tracking-[0.3em] text-slate-400">Email</Label>
						<Input
							type="email"
							placeholder="you@email.com"
							value={createEmail}
							onChange={(event) => setCreateEmail(event.target.value)}
							disabled={createState.status === "loading"}
							required
						/>
					</div>
					<Button className="w-full" type="submit" disabled={createState.status === "loading"}>
						{createState.status === "loading" ? "Creating…" : "Create account"}
					</Button>
				</form>
				<p className={`mt-3 text-sm ${feedbackClass(createState)}`}>{createState.message}</p>
			</CardContent>
		</>
	);
}
