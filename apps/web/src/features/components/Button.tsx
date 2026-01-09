import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import React from "react";

import { cn } from "@/lib/utils";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  icon,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-border bg-card text-foreground hover:bg-muted/60",
    ghost: "hover:bg-muted text-foreground",
  };

  const sizes = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-8 text-base",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "",
        className,
      )}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </motion.button>
  );
};
