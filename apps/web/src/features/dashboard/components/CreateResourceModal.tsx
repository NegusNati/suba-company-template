import type * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function CreateResourceModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: CreateResourceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("", className)}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">
              {title} dialog
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="py-4 px-1 rounded-none overflow-x-auto overflow-y-auto scrollbar-hide ">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
