import { Toaster as Sonner, toast } from "sonner";
import { useTheme } from "@/components/theme-provider";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme } = useTheme();

	return (
		<Sonner
			theme={theme}
			className="toaster group"
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
					description: "group-[.toast]:text-muted-foreground",
					actionButton:
						"group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground group-[.toaster]:hover:bg-primary/90",
					cancelButton:
						"group-[.toaster]:bg-muted group-[.toaster]:text-muted-foreground group-[.toaster]:hover:bg-muted/80",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster, toast };
