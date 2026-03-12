import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/useUser";
import { AppLayout } from "./Layout";

export function Profile() {
	const { user } = useUser();
	const [username, setUsername] = useState(user?.username ?? "");
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [message, setMessage] = useState("");

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		const trimmed = username.trim();
		if (!trimmed) return;

		setStatus("loading");
		setMessage("");

		try {
			const res = await fetch("/api/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				// userId is no longer sent — the worker reads it from the session cookie
				body: JSON.stringify({ username: trimmed }),
			});
			const body = (await res.json()) as { message: string };
			if (!res.ok) throw new Error(body.message);
			setStatus("success");
			setMessage("Username updated.");
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
