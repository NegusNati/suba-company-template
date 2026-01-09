import { Search } from "lucide-react";
import type { FormEvent } from "react";
import React from "react";

interface BlogSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export const BlogSearchBar: React.FC<BlogSearchBarProps> = ({
  value,
  onChange,
  onSubmit,
}) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full md:w-96">
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search for a topic"
          className="w-full h-12 bg-muted rounded-xl px-4 text-sm text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        />
      </div>
      <button
        type="submit"
        className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        aria-label="Search"
      >
        <Search size={20} />
      </button>
    </form>
  );
};
