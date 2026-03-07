import { motion } from "framer-motion";
import type { ComponentProps } from "react";

interface BGButtonProps extends ComponentProps<"button"> {
	children: React.ReactNode;
	className?: string;
}

export function BGButton({ children, onClick, className = "", disabled }: BGButtonProps) {
	return (
		<motion.button
			whileHover={disabled ? undefined : "hover"}
			whileTap={disabled ? undefined : "tap"}
			initial="initial"
			className={`group relative h-20 rounded-lg flex items-center justify-center overflow-hidden bg-secondary/60 font-kh cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
			onClick={onClick}
			disabled={disabled}
		>
			<motion.div
				variants={{
					initial: { scale: 1, opacity: 0.7 },
					hover: { scale: 1.05, opacity: 1 },
					tap: { scale: 1, opacity: 1 },
				}}
				transition={{ duration: 0.3, ease: "easeOut" }}
				className="absolute inset-0 bg-gradient-to-br from-red-500 to-blue-500 -z-10"
			/>

			<motion.span
				variants={{
					initial: { y: 0 },
					hover: { y: -2 },
					tap: { y: 0 },
				}}
				className="relative z-10 font-bold text-secondary-foreground drop-shadow-md"
			>
				{children}
			</motion.span>

			<div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-colors duration-300 -z-10" />
		</motion.button>
	);
}
