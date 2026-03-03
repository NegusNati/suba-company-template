import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { GalleryPreview } from "./gallery-preview";
import { useGalleryCategoriesQuery } from "../../gallery-categories/lib";
import { GalleryImagesManager } from "../components/GalleryImagesManager";
import {
  type GalleryImageWithFile,
  useCreateGalleryItemMutation,
  useUpdateGalleryItemMutation,
} from "../lib";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/lib/api-base";
import { useDashboardForm } from "@/lib/forms";
import { toastApiError } from "@/lib/toast";

type FormMode = "create" | "edit" | "view";

interface GalleryItemFormProps {
  mode?: FormMode;
  initialData?: {
    id?: number;
    title?: string;
    description?: string;
    occurredAt?: string | null;
    categoryId?: number;
    imageUrls?: string[];
  };
}

const galleryFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().optional(),
  occurredAt: z.string().optional(),
  categoryId: z.number().int().positive("Category is required"),
});

type GalleryFormValues = z.infer<typeof galleryFormSchema>;

const resolveImageUrl = (url?: string | null) => {
  if (!url) return "";
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return url.startsWith("/") ? `${baseUrl}${url}` : url;
};

const toDateTimeLocalValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (num: number) => num.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toIsoDateTime = (value?: string) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

export function GalleryItemForm({
  mode = "create",
  initialData,
}: GalleryItemFormProps) {
  const navigate = useNavigate();
  const [images, setImages] = useState<GalleryImageWithFile[]>(
    (initialData?.imageUrls ?? []).map((imageUrl, index) => ({
      imageUrl,
      position: index,
    })),
  );

  const { data: categoriesData, isPending: isCategoriesLoading } =
    useGalleryCategoriesQuery(
      { limit: 100, sortBy: "name", sortOrder: "asc" },
      { staleTime: 1000 * 60 * 5 },
    );
  const categories = categoriesData?.data ?? [];

  const createMutation = useCreateGalleryItemMutation({
    onSuccess: () => {
      toast.success("Gallery entry created successfully.");
      navigate({ to: "/dashboard/gallery" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to create gallery entry");
    },
  });

  const updateMutation = useUpdateGalleryItemMutation({
    onSuccess: () => {
      toast.success("Gallery entry updated successfully.");
      navigate({ to: "/dashboard/gallery" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to update gallery entry");
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
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      occurredAt: toDateTimeLocalValue(initialData?.occurredAt),
      categoryId: initialData?.categoryId ?? 0,
    },
    validators: {
      onSubmit: galleryFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (mode === "view") return;

      if (images.length === 0) {
        toast.error("Please add at least one image.");
        return;
      }

      const normalizedImages = images.map((image, index) => ({
        ...image,
        position: index,
      }));
      const payload = {
        title: value.title,
        description: value.description || undefined,
        occurredAt: toIsoDateTime(value.occurredAt),
        categoryId: value.categoryId,
        images: normalizedImages,
      };

      if (mode === "create") {
        await createMutation.mutateAsync(payload);
        return;
      }

      const itemId = initialData?.id;
      if (!itemId) {
        throw new Error("Gallery item ID is required for update");
      }

      await updateMutation.mutateAsync({
        id: itemId,
        data: payload,
      });
    },
  });

  const imagePreviewUrls = images
    .map((image) => image.previewUrl || resolveImageUrl(image.imageUrl))
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl));

  const isReadOnly = mode === "view";

  return (
    <div className="flex h-screen flex-col">
      <div className="sticky top-0 left-0 right-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-8">
        <h1 className="text-2xl font-bold">
          {mode === "create"
            ? "Add Gallery Entry"
            : mode === "edit"
              ? "Edit Gallery Entry"
              : "View Gallery Entry"}
        </h1>

        <div className="flex gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/dashboard/gallery" })}
          >
            Cancel
          </Button>
          {!isReadOnly && (
            <Button type="submit" form="gallery-form" disabled={isLoading}>
              {isLoading
                ? mode === "create"
                  ? "Adding..."
                  : "Saving..."
                : mode === "create"
                  ? "Add Entry"
                  : "Save Entry"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-full overflow-y-auto border-r border-gray-200 p-8 lg:w-1/2">
          <form
            id="gallery-form"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field name="title">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Title <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="Enter gallery title"
                      disabled={isLoading || isReadOnly}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="categoryId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>
                      Category <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Select
                      value={
                        field.state.value > 0 ? String(field.state.value) : ""
                      }
                      onValueChange={(value) =>
                        field.handleChange(Number(value))
                      }
                      disabled={isLoading || isReadOnly || isCategoriesLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Add an optional description"
                    disabled={isLoading || isReadOnly}
                    rows={4}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="occurredAt">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Occurred On</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="datetime-local"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    disabled={isLoading || isReadOnly}
                  />
                </Field>
              )}
            </form.Field>

            <GalleryImagesManager
              images={images}
              onChange={setImages}
              isReadOnly={isReadOnly}
              allowBulkAdd
            />
          </form>
        </div>

        <div className="hidden w-1/2 overflow-y-auto bg-muted/30 p-8 lg:block">
          <form.Subscribe
            selector={(state) => ({
              title: state.values.title,
              description: state.values.description,
              occurredAt: state.values.occurredAt,
              categoryId: state.values.categoryId,
            })}
          >
            {(formValues) => {
              const selectedCategoryName = categories.find(
                (category) => category.id === formValues.categoryId,
              )?.name;

              return (
                <GalleryPreview
                  title={formValues.title}
                  description={formValues.description}
                  occurredAt={formValues.occurredAt}
                  categoryName={selectedCategoryName}
                  imagePreviews={imagePreviewUrls}
                />
              );
            }}
          </form.Subscribe>
        </div>
      </div>
    </div>
  );
}
