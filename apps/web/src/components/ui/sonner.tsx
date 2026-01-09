import { Toaster as Sonner, type ToasterProps } from "sonner";

import { useTheme } from "@/context/theme-context";

const toasterStyle = {
  "--normal-bg": "var(--popover)",
  "--normal-text": "var(--popover-foreground)",
  "--normal-border": "var(--border)",
};

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={toasterStyle as ToasterProps["style"]}
      {...props}
    />
  );
};

export { Toaster };
