import { GripVertical, ImageIcon, Plus, Trash2 } from "lucide-react";

import type { BusinessSectorGalleryFormItem } from "../lib/business-sectors-schema";

import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/lib/api-base";

interface SectorGalleryManagerProps {
  gallery: BusinessSectorGalleryFormItem[];
  onChange: (items: BusinessSectorGalleryFormItem[]) => void;
  isReadOnly?: boolean;
}

const resolveImageUrl = (url?: string) => {
  if (!url) return "";
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return url.startsWith("/") ? `${baseUrl}${url}` : url;
};

const normalizePositions = (items: BusinessSectorGalleryFormItem[]) =>
  items.map((item, index) => ({ ...item, position: index }));

export function SectorGalleryManager({
  gallery,
  onChange,
  isReadOnly = false,
}: SectorGalleryManagerProps) {
  const addImage = () => {
    onChange(
      normalizePositions([
        ...gallery,
        {
          position: gallery.length,
        },
      ]),
    );
  };

  const updateImage = (
    index: number,
    patch: Partial<BusinessSectorGalleryFormItem>,
  ) => {
    const next = [...gallery];
    const current = next[index];
    if (!current) return;

    next[index] = { ...current, ...patch };
    onChange(normalizePositions(next));
  };

  const removeImage = (index: number) => {
    onChange(normalizePositions(gallery.filter((_, i) => i !== index)));
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...gallery];
    [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
    onChange(normalizePositions(next));
  };

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <FieldLabel>Gallery</FieldLabel>
        {!isReadOnly && (
          <Button type="button" variant="outline" size="sm" onClick={addImage}>
            <Plus className="mr-2 h-4 w-4" />
            Add Image
          </Button>
        )}
      </div>

      {gallery.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No gallery images added.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((item, index) => {
            const preview = item.previewUrl || resolveImageUrl(item.imageUrl);

            return (
              <div
                key={`gallery-${index}`}
                className="rounded-lg border bg-background p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  )}

                  {!isReadOnly && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    updateImage(index, {
                      imageFile: file,
                      previewUrl: URL.createObjectURL(file),
                    });
                  }}
                  disabled={isReadOnly}
                />

                {preview ? (
                  <div className="mt-3 h-36 overflow-hidden rounded-md border bg-muted">
                    <img
                      src={preview}
                      alt={`Gallery ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mt-3 flex h-20 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span className="ml-2 text-sm">No image selected</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
