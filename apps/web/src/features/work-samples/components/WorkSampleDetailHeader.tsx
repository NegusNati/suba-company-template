import { ArrowLeft } from "lucide-react";
import React from "react";

interface WorkSampleDetailHeaderProps {
  onBack: () => void;
  backLabel?: string;
}

export const WorkSampleDetailHeader: React.FC<WorkSampleDetailHeaderProps> = ({
  onBack,
  backLabel = "Sample Works",
}) => (
  <button
    onClick={onBack}
    className="flex items-center gap-2 text-sm font-medium text-foreground mb-8 hover:text-primary transition-colors group"
  >
    <ArrowLeft
      size={20}
      className="group-hover:-translate-x-1 transition-transform"
    />
    {backLabel}
  </button>
);
