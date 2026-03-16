import { Tabs as TabsPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			className={cn("flex flex-col gap-2", className)}
			{...props}
		/>
	);
}

function TabsList({
	className,
	variant = "default",
	...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
	variant?: "default" | "line";
}) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			data-variant={variant}
			className={cn(
				"inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
				variant === "line" && "w-full justify-start rounded-none border-b bg-transparent px-0 py-1",
				className
			)}
			{...props}
		/>
	);
}

function TabsTrigger({
	className,
	variant = "default",
	...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
	variant?: "default" | "line";
}) {
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			className={cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
				"data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
				variant === "line" &&
					"rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-accent-foreground/80 data-[state=active]:bg-transparent data-[state=active]:shadow-none",
				className
			)}
			{...props}
		/>
	);
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			className={cn(
				"flex-1 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				className
			)}
			{...props}
		/>
	);
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
