import { Children, cloneElement, isValidElement, type PropsWithChildren } from "react";
import "./GlareHover.css";
import type React from "react";

interface GlareHoverProps {
	width?: string;
	height?: string;
	background?: string;
	hoverBackground?: string;
	borderRadius?: string;
	borderColor?: string;
	glareColor?: string;
	glareOpacity?: number;
	glareAngle?: number;
	glareSize?: number;
	transitionDuration?: number;
	playOnce?: boolean;
	className?: string;
	style?: React.CSSProperties;
	asChild?: boolean;
}
const GlareHover: React.FC<PropsWithChildren<GlareHoverProps>> = ({
	asChild = false,
	width = "500px",
	height = "500px",
	background = "#000",
	hoverBackground,
	borderRadius = "10px",
	borderColor = "#333",
	children,
	glareColor = "#ffffff",
	glareOpacity = 0.5,
	glareAngle = -45,
	glareSize = 250,
	transitionDuration = 650,
	playOnce = false,
	className = "",
	style = {},
}) => {
	const hex = glareColor.replace("#", "");
	let rgba = glareColor;
	if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
	} else if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
		const r = parseInt(hex[0] + hex[0], 16);
		const g = parseInt(hex[1] + hex[1], 16);
		const b = parseInt(hex[2] + hex[2], 16);
		rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
	}

	const vars = {
		"--gh-width": width,
		"--gh-height": height,
		"--gh-bg": background,
		...(hoverBackground ? { "--gh-bg-hover": hoverBackground } : {}),
		"--gh-br": borderRadius,
		"--gh-angle": `${glareAngle}deg`,
		"--gh-duration": `${transitionDuration}ms`,
		"--gh-size": `${glareSize}%`,
		"--gh-rgba": rgba,
		"--gh-border": borderColor,
	};

	const mergedClassName = `glare-hover ${playOnce ? "glare-hover--play-once" : ""} ${className}`;
	const mergedStyle = { ...vars, ...style } as React.CSSProperties;

	if (asChild) {
		const child = Children.only(children);

		if (!isValidElement<{ className?: string; style?: React.CSSProperties }>(child)) {
			return null;
		}

		return cloneElement(child, {
			className: [mergedClassName, child.props.className].filter(Boolean).join(" "),
			style: { ...mergedStyle, ...child.props.style },
		});
	}

	return (
		<div className={mergedClassName} style={mergedStyle}>
			{children}
		</div>
	);
};

export default GlareHover;
