import {
  GripVertical,
  ImageIcon,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import type { GalleryImageWithFile } from "../lib/gallery-schema";

import { AppImage } from "@/components/common/AppImage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/lib/api-base";
import { ACCEPTED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/forms";

interface GalleryImagesManagerProps {
  images: GalleryImageWithFile[];
  onChange: (images: GalleryImageWithFile[]) => void;
  isReadOnly?: boolean;
  allowBulkAdd?: boolean;
}

const resolveImageUrl = (url?: string | null) => {
  if (!url) return "";
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return url.startsWith("/") ? `${baseUrl}${url}` : url;
};

export function GalleryImagesManager({
  images,
  onChange,
  isReadOnly = false,
  allowBulkAdd = true,
}: GalleryImagesManagerProps) {
  const bulkFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    image: File | null;
    previewUrl: string;
    existingImageUrl: string | null;
  }>({
    image: null,
    previewUrl: "",
    existingImageUrl: null,
  });
  const [errors, setErrors] = useState<{ image?: string }>({});

  const resetForm = () => {
    setFormData({
      image: null,
      previewUrl: "",
      existingImageUrl: null,
    });
    setErrors({});
  };

  const validate = () => {
    const nextErrors: { image?: string } = {};
    if (!formData.previewUrl && !formData.existingImageUrl) {
      nextErrors.image = "Image is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const getFileValidationError = (file: File) => {
    if (
      !ACCEPTED_IMAGE_MIME_TYPES.includes(
        file.type as (typeof ACCEPTED_IMAGE_MIME_TYPES)[number],
      )
    ) {
      return "invalid file type";
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return `file exceeds ${Math.round(MAX_IMAGE_SIZE_BYTES / 1024 / 1024)}MB`;
    }

    return null;
  };

  const handleImageChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;

    const validationError = getFileValidationError(file);
    if (validationError) {
      toast.error(`Unable to use "${file.name}": ${validationError}`);
      return;
    }

    setFormData({
      image: file,
      previewUrl: URL.createObjectURL(file),
      existingImageUrl: null,
    });
  };

  const handleBulkImageChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validItems: GalleryImageWithFile[] = [];
    let invalidTypeCount = 0;
    let tooLargeCount = 0;

    Array.from(files).forEach((file) => {
      const validationError = getFileValidationError(file);
      if (!validationError) {
        validItems.push({
          image: file,
          previewUrl: URL.createObjectURL(file),
        });
        return;
      }

      if (validationError === "invalid file type") {
        invalidTypeCount += 1;
      } else {
        tooLargeCount += 1;
      }
    });

    if (invalidTypeCount > 0 || tooLargeCount > 0) {
      const messages: string[] = [];
      if (invalidTypeCount > 0) {
        messages.push(
          `${invalidTypeCount} file(s) skipped due to invalid image type`,
        );
      }
      if (tooLargeCount > 0) {
        messages.push(
          `${tooLargeCount} file(s) skipped because size exceeds ${Math.round(
            MAX_IMAGE_SIZE_BYTES / 1024 / 1024,
          )}MB`,
        );
      }
      toast.error(messages.join(". "));
    }

    if (validItems.length === 0) return;

    const startPosition = images.length;
    onChange([
      ...images,
      ...validItems.map((item, index) => ({
        ...item,
        position: startPosition + index,
      })),
    ]);
  };

  const handleAdd = () => {
    if (!validate()) return;

    onChange([
      ...images,
      {
        image: formData.image ?? undefined,
        imageUrl: formData.existingImageUrl ?? undefined,
        previewUrl: formData.previewUrl || undefined,
        position: images.length,
      },
    ]);

    resetForm();
    setIsAddOpen(false);
  };

  const handleEdit = () => {
    if (!validate() || editingImage === null) return;

    const updated = [...images];
    updated[editingImage] = {
      ...updated[editingImage],
      image: formData.image ?? undefined,
      imageUrl: formData.existingImageUrl ?? undefined,
      previewUrl: formData.previewUrl || undefined,
    };

    onChange(
      updated.map((item, index) => ({
        ...item,
        position: index,
      })),
    );

    resetForm();
    setEditingImage(null);
  };

  const openEdit = (index: number) => {
    const image = images[index];
    if (!image) return;

    setEditingImage(index);
    setFormData({
      image: image.image || null,
      previewUrl: image.previewUrl || "",
      existingImageUrl: image.imageUrl || null,
    });
  };

  const handleDelete = (index: number) => {
    onChange(
      images
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, position: i })),
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated.map((item, i) => ({ ...item, position: i })));
  };

  const getPreviewUrl = (image: GalleryImageWithFile) => {
    if (image.previewUrl) return image.previewUrl;
    if (image.imageUrl) return resolveImageUrl(image.imageUrl);
    return null;
  };

  const getCurrentPreviewUrl = () => {
    if (formData.previewUrl) return formData.previewUrl;
    if (formData.existingImageUrl)
      return resolveImageUrl(formData.existingImageUrl);
    return null;
  };

  const dialogTitle = editingImage === null ? "Add Image" : "Edit Image";

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <FieldLabel>
          Images <span className="text-red-500">*</span>
        </FieldLabel>

        {!isReadOnly && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                if (allowBulkAdd) {
                  bulkFileInputRef.current?.click();
                  return;
                }

                resetForm();
                setIsAddOpen(true);
              }}
            >
              {allowBulkAdd ? (
                <Upload className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {allowBulkAdd ? "Add Images" : "Add Image"}
            </Button>

            {allowBulkAdd && (
              <input
                ref={bulkFileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_MIME_TYPES.join(",")}
                multiple
                className="hidden"
                onChange={(event) => {
                  handleBulkImageChange(event.target.files);
                  event.currentTarget.value = "";
                }}
              />
            )}
          </>
        )}
      </div>

      {images.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => {
            const previewUrl = getPreviewUrl(image);

            return (
              <div
                key={`gallery-image-${index}`}
                className="group flex gap-3 rounded-lg border bg-background p-3 shadow-sm"
              >
                {!isReadOnly && (
                  <div className="flex flex-col justify-center">
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  {previewUrl ? (
                    <AppImage
                      src={previewUrl}
                      alt={`Gallery image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {!isReadOnly && (
                  <div className="ml-auto flex flex-col gap-1 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(index)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          No images added yet.{" "}
          {!isReadOnly && "Use Add Images to upload in batch."}
        </div>
      )}

      <Dialog
        open={isAddOpen || editingImage !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingImage(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              Upload an image to include in this gallery entry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Field data-invalid={!!errors.image}>
              <FieldLabel>Image</FieldLabel>
              <div className="flex items-center gap-4">
                <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                  {getCurrentPreviewUrl() ? (
                    <AppImage
                      src={getCurrentPreviewUrl() || ""}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <Input
                  type="file"
                  accept={ACCEPTED_IMAGE_MIME_TYPES.join(",")}
                  onChange={(event) => handleImageChange(event.target.files)}
                />
              </div>

              {errors.image && (
                <FieldError errors={[{ message: errors.image }]} />
              )}
            </Field>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setEditingImage(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={editingImage === null ? handleAdd : handleEdit}>
              {editingImage === null ? "Add Image" : "Update Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
