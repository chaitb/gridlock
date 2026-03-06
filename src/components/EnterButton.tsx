import { motion } from "framer-motion";
import { useLocation } from "wouter";
import champion from "@/assets/cheq.jpg";

export function EnterButton() {
	const [location, navigate] = useLocation();
	return (
		<motion.button
			whileHover="hover"
			whileTap="tap"
			initial="initial"
			className="group relative w-full h-60 rounded-lg flex items-center justify-center overflow-hidden bg-secondary/80 font-kh cursor-pointer"
			onClick={() => navigate(`${location}/prediction`)}
		>
			<motion.img
				src={champion}
				alt="enter"
				variants={{
					initial: { scale: 1, filter: "grayscale(100%)", opacity: 0.7 },
					hover: { scale: 1.1, filter: "grayscale(0%)", opacity: 1 },
					tap: { scale: 1.05, filter: "grayscale(0%)", opacity: 1 },
				}}
				transition={{ duration: 0.4, ease: "easeOut" }}
				className="absolute inset-0 w-full h-full object-cover pointer-events-none -z-10"
			/>

			<motion.span
				variants={{
					initial: { y: 0 },
					hover: { y: -2 },
					tap: { y: 0 },
				}}
				className="relative z-10 font-bold text-primary drop-shadow-md text-4xl"
			>
				Enter Now
			</motion.span>

			<div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 -z-10" />
		</motion.button>
	);
}
