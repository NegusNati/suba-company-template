import { cn } from "@/lib/utils";

interface DottedBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  dotSize?: number;
  dotSpacing?: number;
  dotOpacity?: number;
}

export const DottedBackground: React.FC<DottedBackgroundProps> = ({
  children,
  className,
  dotSize = 1.5,
  dotSpacing = 20,
  dotOpacity = 0.3,
}) => {
  return (
    <div
      className={cn("relative", className)}
      style={{
        backgroundImage: `radial-gradient(circle, hsl(var(--primary) / ${dotOpacity}) ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${dotSpacing}px ${dotSpacing}px`,
      }}
    >
      {children}
    </div>
  );
};
