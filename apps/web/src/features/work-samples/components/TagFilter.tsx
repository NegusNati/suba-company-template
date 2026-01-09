import React from "react";

import { cn } from "@/lib/utils";

interface TagFilterProps {
  tags: Array<{ id: number; name: string; slug: string }>;
  selectedTagId: number | null;
  onTagSelect: (tagId: number | null) => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  selectedTagId,
  onTagSelect,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onTagSelect(null)}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
          selectedTagId === null
            ? "bg-foreground text-background border-foreground"
            : "bg-white text-foreground border-gray-200 hover:border-gray-300",
        )}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onTagSelect(tag.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
            selectedTagId === tag.id
              ? "bg-foreground text-background border-foreground"
              : "bg-white text-foreground border-gray-200 hover:border-gray-300",
          )}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
};
