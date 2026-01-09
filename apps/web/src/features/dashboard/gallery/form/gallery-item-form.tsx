import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { GalleryPreview } from "./gallery-preview";
import {
  useCreateGalleryItemMutation,
  useUpdateGalleryItemMutation,
  type UpdateGalleryItem,
} from "../lib";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/lib/api-base";
import { useDashboardForm } from "@/lib/forms";
import { toastApiError } from "@/lib/toast";
import { useUploadField } from "@/lib/useUploadField";

type FormMode = "create" | "edit" | "view";

interface GalleryItemFormProps {
  mode?: FormMode;
  initialData?: UpdateGalleryItem & { id?: number; imageUrl?: string };
}

type GalleryFormValues = {
  title: string;
  description: string;
  occurredAt?: string;
};

export function GalleryItemForm({
  mode = "create",
  initialData,
}: GalleryItemFormProps) {
  const navigate = useNavigate();

  // Resolve existing image URL for preview
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  const resolvedInitialImageUrl = initialData?.imageUrl
    ? initialData.imageUrl.startsWith("/")
      ? `${baseUrl}${initialData.imageUrl}`
      : initialData.imageUrl
    : null;

  const {
    files,
    previews,
    handleFiles,
    reset: resetFiles,
  } = useUploadField({
    accept: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    initialUrls: resolvedInitialImageUrl ? [resolvedInitialImageUrl] : [],
  });

  // Mutations
  const createMutation = useCreateGalleryItemMutation({
    onSuccess: () => {
      toast.success("Gallery item created successfully!");
      navigate({ to: "/dashboard/gallery" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to create gallery item");
    },
  });

  const updateMutation = useUpdateGalleryItemMutation({
    onSuccess: () => {
      toast.success("Gallery item updated successfully!");
      navigate({ to: "/dashboard/gallery" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to update gallery item");
    },
  });

  const isLoading =
    mode === "create"
      ? createMutation.isPending
      : mode === "edit"
        ? updateMutation.isPending
        : false;

  const form = useDashboardForm<GalleryFormValues>({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      occurredAt: initialData?.occurredAt || "",
    },
    // Validation happens at API level
    onSubmit: async ({ value }) => {
      if (mode === "view") return;

      if (mode === "create") {
        // Image is required for create
        if (!files[0]) {
          toast.error("Please select an image");
          return;
        }

        await createMutation.mutateAsync({
          title: value.title,
          description: value.description,
          occurredAt: value.occurredAt || undefined,
          image: files[0],
        });
      } else {
        const itemId = initialData?.id;
        if (!itemId) {
          throw new Error("Gallery item ID is required for update");
        }

        // Only send imageUrl if no new file is being uploaded
        const shouldSendImageUrl = initialData?.imageUrl && !files[0];

        const payload: {
          title: string;
          description: string;
          occurredAt?: string;
          imageUrl?: string;
          image?: File;
        } = {
          title: value.title,
          description: value.description,
          occurredAt: value.occurredAt || undefined,
          image: files[0] || undefined,
        };

        if (shouldSendImageUrl) {
          payload.imageUrl = initialData?.imageUrl ?? undefined;
        }

        await updateMutation.mutateAsync({
          id: itemId,
          data: payload,
        });
      }

      resetFiles();
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const { errors } = handleFiles(e.target.files);
    if (errors.length) {
      toast.error(errors.join("\n"));
    }
  };

  const currentImagePreview = previews[0] ?? resolvedInitialImageUrl ?? null;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-8 flex items-center justify-between border-b border-gray-200 sticky top-0 left-0 right-0 bg-white z-10">
        <h1 className="text-2xl font-bold">
          {mode === "create"
            ? "Add Gallery Item"
            : mode === "edit"
              ? "Edit Gallery Item"
              : "View Gallery Item"}
        </h1>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/dashboard/gallery" })}
          >
            Cancel
          </Button>
          {mode !== "view" && (
            <Button type="submit" form="gallery-form" disabled={isLoading}>
              {isLoading
                ? mode === "create"
                  ? "Adding..."
                  : "Saving..."
                : mode === "create"
                  ? "Add Image"
                  : "Save Changes"}
            </Button>
          )}
        </div>
      </div>

      {/* Content - Form and Preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Form section (scrollable) */}
        <div className="w-1/2 p-8 border-r border-gray-200 overflow-y-auto">
          <form
            id="gallery-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            {/* Image Upload */}
            <Field>
              <FieldLabel>
                Image{" "}
                {mode === "create" && <span className="text-red-500">*</span>}
              </FieldLabel>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                disabled={isLoading || mode === "view"}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Select an image (JPEG, PNG, GIF, or WebP). Max size: 10MB.
              </p>
              {currentImagePreview && (
                <div className="mt-4">
                  <img
                    src={currentImagePreview}
                    alt="Selected preview"
                    className="h-40 w-auto rounded border object-cover"
                  />
                </div>
              )}
            </Field>

            {/* Title */}
            <form.Field name="title">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Title (Optional)</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    placeholder="Enter a title for this image"
                    disabled={isLoading || mode === "view"}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            {/* Description */}
            <form.Field name="description">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Description (Optional)
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    placeholder="Add a description for this image"
                    disabled={isLoading || mode === "view"}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rows={4}
                  />
                </Field>
              )}
            </form.Field>

            {/* Occurred At */}
            <form.Field name="occurredAt">
              {(field) => {
                // Convert ISO string to datetime-local format for display
                const displayValue = field.state.value
                  ? field.state.value.slice(0, 16)
                  : "";

                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Occurred On (Optional)
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="datetime-local"
                      value={displayValue}
                      onBlur={field.handleBlur}
                      disabled={isLoading || mode === "view"}
                      onChange={(e) => {
                        // Store as datetime-local format (YYYY-MM-DDTHH:mm)
                        field.handleChange(e.target.value);
                      }}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      When was this photo taken or event occurred?
                    </p>
                  </Field>
                );
              }}
            </form.Field>
          </form>
        </div>

        {/* Preview section (scrollable) */}
        <div className="w-1/2 p-8 overflow-y-auto bg-muted/30">
          <form.Subscribe
            selector={(state) => ({
              title: state.values.title,
              description: state.values.description,
              occurredAt: state.values.occurredAt,
            })}
          >
            {(formValues) => (
              <GalleryPreview
                title={formValues.title}
                description={formValues.description}
                occurredAt={formValues.occurredAt}
                imagePreview={currentImagePreview}
              />
            )}
          </form.Subscribe>
        </div>
      </div>
    </div>
  );
}
