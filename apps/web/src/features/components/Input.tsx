import React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ className, label, ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={cn(
          "flex h-12 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className,
        )}
        {...props}
      />
    </div>
  );
};

export const TextArea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }
> = ({ className, label, ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none",
          className,
        )}
        {...props}
      />
    </div>
  );
};
