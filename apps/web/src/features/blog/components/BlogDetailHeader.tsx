import { ArrowLeft } from "lucide-react";
import React from "react";

interface BlogDetailHeaderProps {
  onBack: () => void;
}

export const BlogDetailHeader: React.FC<BlogDetailHeaderProps> = ({
  onBack,
}) => (
  <button
    onClick={onBack}
    className="inline-flex items-center gap-2 text-sm font-medium text-foreground mb-6 px-4 py-2 rounded-full border border-[#e3e7da] hover:border-primary/70 hover:text-primary transition-colors group"
  >
    <ArrowLeft
      size={18}
      className="group-hover:-translate-x-1 transition-transform"
    />
    Blogs
  </button>
);
