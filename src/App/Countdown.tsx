import { motion } from "framer-motion";
import type React from "react";
import { memo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Countdown: React.FC<{
	date: Date;
	variant?: "ghost" | "outline" | "solid";
	size?: "sm" | "md" | "lg";
	className?: string;
}> = memo(({ date, variant = "solid", size = "lg", className = "" }) => {
	const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(date));

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft(calculateTimeLeft(date));
		}, 1000);
		return () => clearInterval(timer);
	}, [date]);

	return (
		<div
			className={cn(
				"flex items-center justify-center font-mono",
				{
					"gap-4 ": size === "lg",
					"gap-2 ": size === "md",
					"gap-1 ": size === "sm",
				},
				className
			)}
		>
			{timeLeft.days > 0 && (
				<TimeUnit variant={variant} size={size} value={timeLeft.days} label="Days" />
			)}
			<TimeUnit variant={variant} size={size} value={timeLeft.hours} label="Hours" />
			<TimeUnit variant={variant} size={size} value={timeLeft.minutes} label="Minutes" />
			{size !== "sm" && (
				<TimeUnit variant={variant} size={size} value={timeLeft.seconds} label="Seconds" />
			)}
		</div>
	);
});

const TimeUnit = memo(
	({
		variant = "solid",
		size = "lg",
		value,
		label,
	}: {
		variant?: "ghost" | "outline" | "solid";
		size?: "sm" | "md" | "lg";
		value: number;
		label: string;
	}) => {
		return (
			<div className="flex flex-col items-center">
				<div
					className={cn(
						"relative  overflow-hidden rounded-lg backdrop-blur-sm flex items-center justify-center",
						{
							"size-16 md:size-20": size === "lg",
							"size-4 md:size-8": size === "sm",
							"bg-slate-900/50": variant === "solid",
							"bg-transparent": variant === "ghost",
							"shadow-2xl": variant === "solid" || variant === "outline",
						}
					)}
				>
					<motion.span
						key={value}
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className={cn("font-bold", {
							"text-3xl md:text-4xl": size === "lg",
							"text-sm": size === "sm",
						})}
					>
						{value.toString().padStart(2, "0")}
					</motion.span>
				</div>
				{size === "sm" ? (
					<span className="text-xs uppercase tracking-widest font-sans">
						{label.substring(0, 1)}
					</span>
				) : (
					<span className="mt-2 text-xs uppercase tracking-widest font-sans">{label}</span>
				)}
			</div>
		);
	}
);

// Helper to calculate time differences
function calculateTimeLeft(targetDate: Date) {
	const difference = targetDate.getTime() - Date.now();

	if (difference > 0) {
		return {
			days: Math.floor(difference / (1000 * 60 * 60 * 24)),
			hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
			minutes: Math.floor((difference / 1000 / 60) % 60),
			seconds: Math.floor((difference / 1000) % 60),
		};
	}

	return { days: 0, hours: 0, minutes: 0, seconds: 0 };
}

export default Countdown;
