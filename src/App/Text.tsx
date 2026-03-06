import type React from "react";

export const H1 = ({ children }: { children: React.ReactNode }) => (
	<h1 className="font-audiowide uppercase text-6xl text-primary">
		{children}
	</h1>
);

export const H2 = ({ children }: { children: React.ReactNode }) => (
	<h2 className="font-audiowide mb-2 uppercase text-4xl text-primary">
		{children}
	</h2>
);
