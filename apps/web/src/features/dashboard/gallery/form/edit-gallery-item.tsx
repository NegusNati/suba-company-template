import { useParams } from "@tanstack/react-router";

import { GalleryItemForm } from "./gallery-item-form";
import { useGalleryItemByIdQuery } from "../lib/gallery-query";

export default function EditGalleryItem() {
  const { id } = useParams({ from: "/dashboard/gallery/$id/edit" });
  const numericId = parseInt(id, 10);

  const { data, isPending, isError } = useGalleryItemByIdQuery(numericId);

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
        </div>
      </div>
    );
  }

  return (
    <GalleryItemForm
      mode="edit"
      initialData={{
        id: data.data.id,
        title: data.data.title,
        description: data.data.description ?? "",
        occurredAt: data.data.occurredAt,
        categoryId: data.data.category.id,
        imageUrls: data.data.imageUrls,
      }}
    />
  );
}
