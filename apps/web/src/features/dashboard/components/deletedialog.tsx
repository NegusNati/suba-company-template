import { AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

// 1. Update the props interface
type DeleteDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isDeleting?: boolean; // Add the optional isDeleting prop
};

export function DeleteDialog({
  isOpen,
  onClose,
  onDelete,
  isDeleting = false, // Default to false
}: DeleteDialogProps) {
  if (!isOpen) {
    return null; // Don't render anything if it's not open
  }

  return (
    <div className="fixed inset-0 bg-black/32 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h2 className="text-lg font-semibold">Confirm Deletion </h2>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this item? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-2">
          {/* 2. Disable the Cancel button while deleting */}
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel{" "}
          </Button>
          {/* 3. Disable the Delete button and show a loading state */}
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
