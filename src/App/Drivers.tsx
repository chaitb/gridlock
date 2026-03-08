import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type React from "react";
import type { PropsWithChildren } from "react";
import { BGButton } from "@/components/BGButton";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import type { DriverTag } from "@/model";
import { cn } from "@/lib/utils";
import { DRIVERS } from "./driver";

import HAM from "@/assets/drivers/ham.avif";
import VER from "@/assets/drivers/ver.avif";
import NOR from "@/assets/drivers/nor.avif";
import PER from "@/assets/drivers/per.avif";
import SAI from "@/assets/drivers/sai.avif";
import ALO from "@/assets/drivers/alo.avif";
import LEC from "@/assets/drivers/lec.avif";
import STR from "@/assets/drivers/str.avif";
import ALB from "@/assets/drivers/alb.avif";
import HUL from "@/assets/drivers/hul.avif";
import LAW from "@/assets/drivers/law.avif";
import OCO from "@/assets/drivers/oco.avif";
import LIN from "@/assets/drivers/lin.avif";
import COL from "@/assets/drivers/col.avif";
import BEA from "@/assets/drivers/bea.avif";
import BOR from "@/assets/drivers/bor.avif";
import HAD from "@/assets/drivers/had.avif";
import GAS from "@/assets/drivers/gas.avif";
import ANT from "@/assets/drivers/ant.avif";
import RUS from "@/assets/drivers/rus.avif";
import BOT from "@/assets/drivers/bot.avif";
import PIA from "@/assets/drivers/pia.avif";

const DRIVER_HEADSHOTS: Record<DriverTag, string> = {
	HAM: HAM,
	VER: VER,
	NOR: NOR,
	PER: PER,
	SAI: SAI,
	ALO: ALO,
	LEC: LEC,
	STR: STR,
	ALB: ALB,
	HUL: HUL,
	LAW: LAW,
	OCO: OCO,
	LIN: LIN,
	COL: COL,
	BOR: BOR,
	HAD: HAD,
	GAS: GAS,
	ANT: ANT,
	RUS: RUS,
	BOT: BOT,
	PIA: PIA,
	BEA: BEA,
};

const getDriverImage = (acronym: DriverTag) => {
	return DRIVER_HEADSHOTS[acronym];
};

export type Driver = {
	full_name: string;
	acronym: DriverTag;
	team_name: string;
	colour: string;
	headshot_url: string;
};

export const DriverCard: React.FC<{
	driverTag: string;
	className?: string;
}> = ({ driverTag, className }) => {
	const driver = DRIVERS.find((dr) => dr.acronym === driverTag);
	if (!driver) return null;

	return <DriverCardFull driver={driver} className={className} />;
};
type DriverCardProps = {
	driver: Driver;
	className?: string;
};

export const DriverCardFull: React.FC<DriverCardProps> = ({
	driver,
	className = "",
}) => {
	const color = "#" + driver.colour;

	// ... inside your component
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	// Smooth out the movement
	const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
	const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

	// Map mouse position to rotation (Adjust '20' for more/less tilt)
	const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
	const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;
		const mouseXPos = e.clientX - rect.left;
		const mouseYPos = e.clientY - rect.top;

		// Normalize values between -0.5 and 0.5
		x.set(mouseXPos / width - 0.5);
		y.set(mouseYPos / height - 0.5);
	};

	const handleMouseLeave = () => {
		x.set(0);
		y.set(0);
	};

	return (
		<motion.div
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			style={{
				rotateX,
				rotateY,
				transformStyle: "preserve-3d", // Essential for 3D layering
				borderColor: color,
				backgroundColor: `${color}cc`,
			}}
			whileHover={{ scale: 1.05 }} // Scale the whole card slightly
			className={cn(
				"text-left max-w-96 h-40 relative rounded-xl overflow-hidden select-none texture-bg gradient-bg text-white border-2 cursor-pointer",
				className,
			)}
		>
			{/* Driver Image - Moves more aggressively for parallax depth */}
			<motion.img
				src={getDriverImage(driver.acronym)}
				alt={driver.full_name}
				style={{
					x: useTransform(mouseX, [-0.5, 0.5], [5, -5]), // Inverse move
					z: 50, // Pulls image "forward"
				}}
				className="absolute top-4 right-0 w-50 max-w-[70%] object-contain z-10 pointer-events-none"
			/>

			{/* Content Layer */}
			<motion.div
				style={{ z: 30 }} // Sits between card and image
				className="px-5 py-3 h-full flex flex-col relative z-20"
			>
				<p className="flex-grow font-kh text-5xl mt-4">
					{driver.acronym}
				</p>
				<div>
					<p className="text-[10px] uppercase opacity-80">
						{driver.team_name}
					</p>
					<p className="font-bold leading-tight">
						{driver.full_name.split(" ")[0]}
					</p>
					<p className="font-bold leading-tight">
						{driver.full_name.split(" ")[1]}
					</p>
				</div>
			</motion.div>
		</motion.div>
	);
};

type DriverSelectProps = PropsWithChildren<{
	title: string;
	selectedDriver: DriverTag | null;
	onSelect: (driver: Driver | null) => void;
	subtitle?: string;
	drivers?: Driver[];
	disabled?: boolean;
}>;

export const DriverSelect: React.FC<DriverSelectProps> = ({
	children,
	title,
	subtitle,
	selectedDriver,
	onSelect,
	drivers = DRIVERS,
	disabled = false,
}) => {
	const sDriver = DRIVERS.find((dr) => dr.acronym === selectedDriver);
	return (
		<Drawer direction="bottom">
			<DrawerTrigger asChild>
				{sDriver ? (
					<button
						className="flex-1 min-w-24 h-36"
						type="button"
						onClick={(e) => {
							if (disabled) return;
							onSelect?.(null);
							e.preventDefault();
							e.stopPropagation();
						}}
						disabled={disabled}
					>
						<DriverCardCompact
							driver={sDriver}
							className="h-full w-full rounded-lg"
						/>
					</button>
				) : (
					<BGButton
						className="flex-1 min-w-24 h-36 rounded-lg border border-accent-foreground/60"
						disabled={disabled}
					>
						{children}
					</BGButton>
				)}
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle> {title}</DrawerTitle>
					<DrawerDescription> {subtitle}</DrawerDescription>
				</DrawerHeader>
				<div className="no-scrollbar my-4 overflow-y-auto px-4 py-4">
					<div className="grid mx-auto grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
						{drivers.map((driver) => (
							<DrawerClose key={driver.acronym} asChild>
								<button
									type="button"
									onClick={() => onSelect?.(driver)}
								>
									<DriverCardFull
										driver={driver}
										className="mx-auto"
									/>
								</button>
							</DrawerClose>
						))}
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
};

export const DriverCardCompact: React.FC<DriverCardProps> = ({
	driver,
	className = "",
}) => {
	const color = `#${driver.colour}`;

	return (
		<motion.div
			whileHover={{ scale: 1.0 }}
			className={cn(
				"flex flex-col justify-end relative overflow-hidden select-none border border-border cursor-pointer texture-bg gradient-bg-reverse",
				className,
			)}
			style={{
				// borderColor: color,
				backgroundColor: `${color}cc`,
			}}
		>
			<img
				src={getDriverImage(driver.acronym)}
				alt={driver.full_name}
				className="absolute top-8 scale-110 right-0 left-1/2 -translate-x-1/2 w-50 object-contain z-10 pointer-events-none"
			/>
			<div className="bg-linear-to-t from-black/70 to-transparent px-4 py-2 h-1/2 flex flex-col justify-end relative z-20 text-white">
				<p className="font-kh text-3xl text-shadow-xs">
					{driver.acronym}
				</p>
				<p className="text-xs font-kh opacity-80 truncate">
					{driver.team_name}
				</p>
			</div>
		</motion.div>
	);
};
