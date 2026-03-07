import { motion } from "framer-motion";
import type React from "react";
import { memo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Countdown: React.FC<{ date: Date; className?: string }> = memo(({ date, className = "" }) => {
	const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(date));

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft(calculateTimeLeft(date));
		}, 1000);
		return () => clearInterval(timer);
	}, [date]);

	return (
		<div className={cn("flex items-center justify-center gap-4 font-mono", className)}>
			{timeLeft.days > 0 && <TimeUnit value={timeLeft.days} label="Days" />}
			<TimeUnit value={timeLeft.hours} label="Hours" />
			<TimeUnit value={timeLeft.minutes} label="Minutes" />
			<TimeUnit value={timeLeft.seconds} label="Seconds" />
		</div>
	);
});

const TimeUnit = memo(({ value, label }: { value: number; label: string }) => {
	return (
		<div className="flex flex-col items-center">
			<div className="relative h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-lg bg-slate-900/50 backdrop-blur-sm shadow-2xl flex items-center justify-center">
				<motion.span
					key={value}
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.2, ease: "easeOut" }}
					className="text-3xl md:text-4xl font-bold"
				>
					{value.toString().padStart(2, "0")}
				</motion.span>
			</div>
			<span className="mt-2 text-xs uppercase tracking-widest font-sans">{label}</span>
		</div>
	);
});

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
