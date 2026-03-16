import { useLocation } from "wouter";
import { useUser } from "@/context/useUser";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { user, isLoading } = useUser();
	const [isAnimationComplete, setAnimationComplete] = useState(false);
	const [, navigate] = useLocation();
	useEffect(() => {
		// Only check for redirects once BOTH loading and the animation are totally done
		if (!isLoading && isAnimationComplete && !user) {
			navigate("/login");
		}
	}, [isLoading, isAnimationComplete, user, navigate]);

	// Keep the lights on screen if we are still fetching data OR still animating
	if (isLoading || !isAnimationComplete) {
		return <Lights onComplete={() => setAnimationComplete(true)} />;
	}

	// Prevent a flash of the protected children if the user isn't authenticated
	// The useEffect above will handle the actual redirect to /login
	if (!user) {
		return null;
	}

	return <>{children}</>;
}

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Lights({ onComplete }: { onComplete?: () => void }) {
	const [litLights, setLitLights] = useState(0);
	const [lightsOut, setLightsOut] = useState(false);

	useEffect(() => {
		// Phase 1: Light them up one by one every second
		if (litLights < 5 && !lightsOut) {
			const timer = setTimeout(() => setLitLights((prev) => prev + 1), 300);
			return () => clearTimeout(timer);
		}

		// Phase 2: All 5 are lit. Hold for a random duration, then lights out!
		if (litLights === 5 && !lightsOut) {
			// Random delay between 0.2s and 1.5s to build anticipation
			const randomHold = Math.floor(Math.random() * 300) + 20;
			const timer = setTimeout(() => setLightsOut(true), randomHold);
			return () => clearTimeout(timer);
		}

		// Phase 3: Trigger the callback when lights go out (e.g., remove loading screen)
		if (lightsOut && onComplete) {
			// Small delay so the user actually sees them turn off before unmounting
			const timer = setTimeout(() => onComplete(), 100);
			return () => clearTimeout(timer);
		}
	}, [litLights, lightsOut, onComplete]);

	return (
		<div className="flex h-screen w-screen items-center justify-center">
			<div className="flex gap-1 md:gap-2">
				{[0, 1, 2, 3, 4].map((index) => {
					const isLit = index < litLights && !lightsOut;

					return (
						<div
							key={index}
							className="relative flex items-center justify-center rounded md:rounded-2xl bg-zinc-800 p-3 shadow-inner sm:p-4"
						>
							{/* The Light Bulb */}
							<motion.div
								className="size-6 rounded-full md:size-12"
								initial={false}
								animate={{
									backgroundColor: isLit ? "#ef4444" : "#121213", // tailwind red-500 : zinc-900
									boxShadow: isLit
										? "0 0 30px 10px rgba(239, 68, 68, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.5)"
										: "inset 0 4px 6px rgba(0, 0, 0, 0.6)",
								}}
								transition={{
									duration: 0.1, // Quick, snappy light changes
									ease: "easeInOut",
								}}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
