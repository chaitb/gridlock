import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/useUser";
import { AppLayout } from "./Layout";

export function Profile() {
	const { user } = useUser();
	const [username, setUsername] = useState(user?.username ?? "");
	const [email, setEmail] = useState(user?.email ?? "");
	const [fullName, setFullName] = useState(user?.full_name ?? "");
	const [flair, setFlair] = useState(user?.flair ?? "");
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [message, setMessage] = useState("");

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		const trimmedUsername = username.trim();
		if (!trimmedUsername) return;

		setStatus("loading");
		setMessage("");

		try {
			const res = await fetch("/api/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: trimmedUsername,
					email: email.trim() || undefined,
					full_name: fullName.trim() || null,
					flair: flair.trim() || null,
				}),
			});
			const body = (await res.json()) as { message: string };
			if (!res.ok) throw new Error(body.message);
			setStatus("success");
			setMessage("Profile updated.");
		} catch (err) {
			setStatus("error");
			setMessage(err instanceof Error ? err.message : "Unexpected error");
		}
	};

	return (
		<AppLayout headline="Profile">
			<form onSubmit={handleSubmit} className="mx-3 flex flex-col gap-4 max-w-sm">
				<div className="space-y-1">
					<Label htmlFor="username">Username</Label>
					<Input
						id="username"
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						disabled={status === "loading"}
						required
					/>
				</div>

				<div className="space-y-1">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						disabled={status === "loading"}
					/>
				</div>

				<div className="space-y-1">
					<Label htmlFor="full_name">Full Name</Label>
					<Input
						id="full_name"
						type="text"
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						disabled={status === "loading"}
						placeholder="Optional"
					/>
				</div>

				<div className="space-y-1">
					<Label htmlFor="flair">Flair</Label>
					<Input
						id="flair"
						type="text"
						value={flair}
						onChange={(e) => setFlair(e.target.value)}
						disabled={status === "loading"}
						placeholder="e.g. McLaren, Ferrari fan"
						maxLength={20}
					/>
				</div>

				<Button type="submit" disabled={status === "loading"}>
					{status === "loading" ? "Saving…" : "Save"}
				</Button>
				{message && (
					<p
						className={`text-sm ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}
					>
						{message}
					</p>
				)}
			</form>
		</AppLayout>
	);
}
