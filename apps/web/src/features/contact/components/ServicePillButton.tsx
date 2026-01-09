import { Check } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

interface ServicePillButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const ServicePillButton: React.FC<ServicePillButtonProps> = ({
  label,
  isSelected,
  onClick,
  disabled = false,
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "border-primary bg-transparent text-primary"
          : "border-border bg-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      <span>{label}</span>
      {isSelected && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 500 }}
        >
          <Check className="w-4 h-4" />
        </motion.span>
      )}
    </motion.button>
  );
};
