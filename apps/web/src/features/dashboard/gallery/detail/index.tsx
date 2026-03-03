import { useNavigate, useParams } from "@tanstack/react-router";
import { Edit, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DeleteDialog } from "../../components/deletedialog";
import {
  useDeleteGalleryItemMutation,
  useGalleryItemByIdQuery,
} from "../lib/gallery-query";

import { AppImage } from "@/components/common/AppImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api-base";

const resolveImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) return "";
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return imageUrl.startsWith("/") ? `${baseUrl}${imageUrl}` : imageUrl;
};

const formatDateTime = (dateStr: string | null) => {
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

export default function GalleryDetail() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/dashboard/gallery/$id/" });
  const numericId = Number.parseInt(id, 10);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const { data, isPending, isError } = useGalleryItemByIdQuery(numericId);

  const deleteMutation = useDeleteGalleryItemMutation({
    onSuccess: () => {
      toast.success("Gallery entry deleted successfully.");
      navigate({ to: "/dashboard/gallery" });
    },
    onError: (error) => {
      toast.error(`Failed to delete gallery entry: ${error.message}`);
    },
  });

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading gallery entry...</p>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load gallery entry.</p>
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
  const galleryImages = item.imageUrls.map((imageUrl) =>
    resolveImageUrl(imageUrl),
  );
  const currentImage = galleryImages[activeIndex] ?? galleryImages[0] ?? "";

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate({ to: "/dashboard/gallery" })}
                className="mb-2"
              >
                ← Back to Gallery
              </Button>
              <h1 className="text-3xl font-bold">{item.title}</h1>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  navigate({
                    to: "/dashboard/gallery/$id/edit",
                    params: { id },
                  })
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border bg-muted">
              {currentImage ? (
                <AppImage
                  src={currentImage}
                  alt={`${item.title} image ${activeIndex + 1}`}
                  className="h-[420px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[420px] items-center justify-center text-muted-foreground">
                  No images available
                </div>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {galleryImages.map((imageUrl, index) => (
                  <button
                    key={`${imageUrl}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`overflow-hidden rounded-md border transition ${
                      index === activeIndex
                        ? "border-primary ring-1 ring-primary"
                        : "border-border"
                    }`}
                  >
                    <AppImage
                      src={imageUrl}
                      alt={`${item.title} thumbnail ${index + 1}`}
                      className="h-20 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {item.description ? (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                  Description
                </h3>
                <p className="whitespace-pre-wrap text-base">
                  {item.description}
                </p>
              </div>
            ) : null}

            <div className="space-y-4 border-t pt-6">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Details
              </h3>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Category</span>
                <Badge variant="secondary" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {item.category.name}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Images</span>
                <span className="font-medium">{item.imageUrls.length}</span>
              </div>

              {item.occurredAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Occurred On</span>
                  <span className="font-medium">
                    {formatDateTime(item.occurredAt)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Added On</span>
                <span className="font-medium">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>

              {item.updatedAt !== item.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Modified</span>
                  <span className="font-medium">
                    {formatDateTime(item.updatedAt)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gallery ID</span>
                <span className="font-mono text-sm">{item.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={() => deleteMutation.mutate(numericId)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
