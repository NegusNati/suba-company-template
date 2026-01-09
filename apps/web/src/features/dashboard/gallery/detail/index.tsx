import { useNavigate, useParams } from "@tanstack/react-router";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DeleteDialog } from "../../components/deletedialog";
import {
  useGalleryItemByIdQuery,
  useDeleteGalleryItemMutation,
} from "../lib/gallery-query";

import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api-base";

export default function GalleryDetail() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/dashboard/gallery/$id/" });
  const numericId = parseInt(id, 10);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch gallery item
  const { data, isPending, isError } = useGalleryItemByIdQuery(numericId);

  // Delete mutation
  const deleteMutation = useDeleteGalleryItemMutation({
    onSuccess: () => {
      toast.success("Gallery item deleted successfully!");
      navigate({ to: "/dashboard/gallery" });
    },
    onError: (error) => {
      toast.error(`Failed to delete gallery item: ${error.message}`);
    },
  });

  const handleEdit = () => {
    navigate({ to: `/dashboard/gallery/$id/edit`, params: { id } });
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(numericId);
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading gallery item...</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-destructive">Failed to load gallery item.</p>
          <Button
            className="mt-4"
            onClick={() => navigate({ to: "/dashboard/gallery" })}
          >
            Back to Gallery
          </Button>
        </div>
      </div>
    );
  }

  const item = data.data;
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  const resolveImageUrl = (imageUrl?: string | null) =>
    imageUrl
      ? imageUrl.startsWith("/")
        ? `${baseUrl}${imageUrl}`
        : imageUrl
      : "";

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate({ to: "/dashboard/gallery" })}
                className="mb-2"
              >
                ← Back to Gallery
              </Button>
              <h1 className="text-3xl font-bold">
                {item.title || "Untitled Image"}
              </h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            <img
              src={resolveImageUrl(item.imageUrl)}
              alt={item.title || "Gallery image"}
              className="w-full rounded-lg border shadow-lg"
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Description */}
            {item.description && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Description
                </h3>
                <p className="text-base whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Details
              </h3>

              {item.occurredAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Occurred On:</span>
                  <span className="font-medium">
                    {formatDate(item.occurredAt)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Added On:</span>
                <span className="font-medium">
                  {formatDate(item.createdAt)}
                </span>
              </div>

              {item.updatedAt !== item.createdAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Modified:</span>
                  <span className="font-medium">
                    {formatDate(item.updatedAt)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Gallery ID:</span>
                <span className="font-mono text-sm">{item.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={confirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
