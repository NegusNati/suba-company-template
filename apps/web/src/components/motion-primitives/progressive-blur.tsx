import { cn } from "@/lib/utils";

interface ProgressiveBlurProps {
  className?: string;
  direction?: "left" | "right" | "top" | "bottom";
}

export function ProgressiveBlur({
  className,
  direction = "left",
}: ProgressiveBlurProps) {
  // Mapping direction to gradient
  const gradientMap = {
    left: "to right",
    right: "to left",
    top: "to bottom",
    bottom: "to top",
  };

  return (
    <div
      className={cn("pointer-events-none absolute z-10", className)}
      style={{
        background: `linear-gradient(${gradientMap[direction]},
          rgba(255, 255, 255, 0.32) 0%,
          rgba(255, 255, 255, 0.18) 18%,
          rgba(255, 255, 255, 0.06) 34%,
          rgba(255, 255, 255, 0) 52%)`,
      }}
    />
  );
}
