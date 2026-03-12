import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/context/useUser";
import type { User } from "@/shared/model";
import poster from "../assets/GridLock2026.webp";

type VerifyState = "loading" | "success" | "error";

function VerifyShell({ children }: { children: React.ReactNode }) {
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

export function Verify() {
	const [status, setStatus] = useState<VerifyState>("loading");
	const [message, setMessage] = useState("");
	const [, navigate] = useLocation();
	const { login } = useUser();

	useEffect(() => {
		const token = new URLSearchParams(window.location.search).get("token");

		if (!token) {
			setStatus("error");
			setMessage("No verification token found in the URL. Please use the link from your email.");
			return;
		}

		fetch(`/api/verify?token=${encodeURIComponent(token)}`)
			.then(async (res) => {
				const body = (await res.json()) as { message: string; user?: User };
				if (!res.ok) {
					throw new Error(body.message || "Verification failed");
				}
				if (!body.user) {
					throw new Error("Verification succeeded but no user returned");
				}
				login(body.user);
				setStatus("success");
				// Brief pause so the user sees the success state before navigating
				setTimeout(() => {
					navigate(body.user?.username ? `/u/${body.user.username}` : "/");
				}, 800);
			})
			.catch((err: unknown) => {
				setStatus("error");
				setMessage(err instanceof Error ? err.message : "Unexpected error during verification.");
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [login, navigate]);

	return (
		<VerifyShell>
			<p className="font-kh text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
				GridLock 2026
			</p>

			{status === "loading" && (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
					<h1 className="text-3xl font-audiowide uppercase font-medium tracking-tight">
						Verifying…
					</h1>
					<p className="text-sm text-muted-foreground">Checking your login link.</p>
				</motion.div>
			)}

			{status === "success" && (
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					className="space-y-3"
				>
					<h1 className="text-3xl font-audiowide uppercase font-medium tracking-tight text-emerald-400">
						Verified
					</h1>
					<p className="text-sm text-muted-foreground">Redirecting you now…</p>
				</motion.div>
			)}

			{status === "error" && (
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					className="space-y-4"
				>
					<h1 className="text-3xl font-audiowide uppercase font-medium tracking-tight text-rose-400">
						Link expired
					</h1>
					<p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
					<button
						type="button"
						onClick={() => navigate("/login")}
						className="text-sm underline underline-offset-2 text-accent-foreground"
					>
						Request a new link →
					</button>
				</motion.div>
			)}
		</VerifyShell>
	);
}
