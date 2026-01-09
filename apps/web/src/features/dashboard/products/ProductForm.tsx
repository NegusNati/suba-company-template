import { LexicalEditor } from "@rich-text/LexicalEditor";
import { type FormValidateOrFn } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import type { infer as ZodInfer } from "zod";

import { AsyncSearchableSelect } from "../components/AsyncSearchableSelect";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "./lib/products-query";
import {
  createProductSchema,
  updateProductSchema,
  type UpdateProduct,
  type Product,
} from "./lib/products-schema";

import { LexicalViewer } from "@/components/common/rich-text/LexicalViewer";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchTags } from "@/features/dashboard/tags/lib/tags-api";
import { tagKeys } from "@/features/dashboard/tags/lib/tags-query";
import {
  normalizeTagListParams,
  type Tag,
} from "@/features/dashboard/tags/lib/tags-schema";
import { API_BASE_URL } from "@/lib/api-base";
import { DEFAULT_DEBOUNCE_MS, useDashboardForm } from "@/lib/forms";
import { toastApiError } from "@/lib/toast";
import { useAsyncSelect, type BaseOption } from "@/lib/useAsyncSelect";
import { useUploadField } from "@/lib/useUploadField";

type FormMode = "create" | "edit" | "view";

interface ProductFormProps {
  mode?: FormMode;
  initialData?: UpdateProduct;
}

const createProductFormSchema = createProductSchema.omit({
  images: true,
  imagesMeta: true,
});
const updateProductFormSchema = updateProductSchema.omit({
  images: true,
  imagesMeta: true,
});
type ProductFormValues = Omit<
  ZodInfer<typeof createProductFormSchema>,
  "tagIds"
> & {
  tagIds: number[];
};

type TagOption = BaseOption & Tag;

const resolveImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) return "";
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return imageUrl.startsWith("/") ? `${baseUrl}${imageUrl}` : imageUrl;
};

export function ProductForm({
  mode = "create",
  initialData,
}: ProductFormProps) {
  const navigate = useNavigate();

  const existingImages =
    initialData?.existingImages?.map((img) => resolveImageUrl(img.imageUrl)) ??
    [];

  const {
    files: uploadFiles,
    previews,
    handleFiles,
    reset: resetUploads,
  } = useUploadField({
    accept: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
    initialUrls: existingImages,
  });

  const tagSelect = useAsyncSelect<TagOption>({
    queryKey: (search) => [...tagKeys.all, "select", search],
    queryFn: async (search) => {
      const params = normalizeTagListParams({
        page: 1,
        limit: 10,
        search: search || undefined,
      });
      const res = await fetchTags(params);
      return (res.data ?? []).map((tag) => ({
        ...tag,
        label: tag.name,
        value: tag.id,
      }));
    },
    debounceMs: DEFAULT_DEBOUNCE_MS,
  });

  const createMutation = useCreateProductMutation({
    onSuccess: () => {
      toast.success("Product created successfully!");
      navigate({ to: "/dashboard/products" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to create product");
    },
  });

  const updateMutation = useUpdateProductMutation({
    onSuccess: () => {
      toast.success("Product updated successfully!");
      navigate({ to: "/dashboard/products" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to update product");
    },
  });

  const isLoading =
    mode === "create"
      ? createMutation.isPending
      : mode === "edit"
        ? updateMutation.isPending
        : false;

  const form = useDashboardForm<ProductFormValues>({
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      overview: initialData?.overview ?? null,
      productLink: initialData?.productLink ?? null,
      tagIds: initialData?.tagIds ?? [],
    } satisfies ProductFormValues,
    validators: {
      onSubmit: (mode === "create"
        ? createProductFormSchema
        : updateProductFormSchema) as FormValidateOrFn<ProductFormValues>,
    },
    onSubmit: async ({ value }) => {
      if (mode === "view") return;

      const tagsToSend = value.tagIds ?? [];
      const imagesMeta =
        uploadFiles.length > 0
          ? uploadFiles.map((file, index) => ({
              position: index,
              caption: file.name,
            }))
          : undefined;

      if (mode === "create") {
        if (uploadFiles.length === 0) {
          toast.error("Please add at least one image");
          return;
        }

        await createMutation.mutateAsync({
          title: value.title,
          description: value.description,
          overview: value.overview,
          productLink: value.productLink ?? null,
          tagIds: tagsToSend,
          imagesMeta,
          images: uploadFiles,
        });
      } else {
        const productId = (initialData as Product | undefined)?.id;
        if (!productId) {
          throw new Error("Product ID is required for update");
        }

        await updateMutation.mutateAsync({
          id: productId,
          payload: {
            title: value.title,
            description: value.description,
            overview: value.overview ?? null,
            productLink: value.productLink ?? null,
            tagIds: tagsToSend,
            imagesMeta,
            images: uploadFiles.length > 0 ? uploadFiles : undefined,
          },
        });
      }

      resetUploads();
    },
  });

  const selectedTags = useMemo(
    () =>
      tagSelect.options.filter((tag) =>
        form.state.values.tagIds.includes(tag.id),
      ),
    [form.state.values.tagIds, tagSelect.options],
  );

  const currentPreviews =
    previews.length > 0
      ? previews
      : existingImages.length > 0
        ? existingImages
        : [];

  const isReadOnly = mode === "view";

  return (
    <div className="flex flex-col h-screen">
      <div className="p-8 flex items-center justify-between border-b border-gray-200 sticky top-0 left-0 right-0 bg-white">
        <h1 className="text-2xl font-bold">
          {mode === "create"
            ? "Create Product"
            : mode === "edit"
              ? "Edit Product"
              : "View Product"}
        </h1>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/dashboard/products" })}
          >
            Back
          </Button>
          {mode !== "view" && (
            <Button type="submit" form="product-form" disabled={isLoading}>
              {isLoading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Product"
                  : "Update Product"}
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-1">
        <div className="w-full lg:w-1/2 p-8 border-r border-gray-200 overflow-y-auto">
          <form
            id="product-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <Field>
              <FieldLabel>Images</FieldLabel>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={(e) => {
                  if (!e.target.files) return;
                  const { errors } = handleFiles(e.target.files);
                  if (errors.length) {
                    toast.error(errors.join("\n"));
                  }
                }}
                disabled={isLoading || isReadOnly}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload product images (max 10MB each). The first image is used
                as the primary display.
              </p>
            </Field>

            <form.Field name="title">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Product Title</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      placeholder="Enter product title"
                      disabled={isLoading || isReadOnly}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="description">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    {isReadOnly ? (
                      <div className="rounded-md border bg-muted/50 p-3">
                        {field.state.value ? (
                          <LexicalViewer content={field.state.value} />
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No description provided.
                          </p>
                        )}
                      </div>
                    ) : (
                      <LexicalEditor
                        value={field.state.value}
                        onChange={field.handleChange}
                        placeholder="Write a detailed product description..."
                      />
                    )}
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="overview">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Overview</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ""}
                      rows={3}
                      maxLength={255}
                      onBlur={field.handleBlur}
                      placeholder="Short overview of the product"
                      disabled={isLoading || isReadOnly}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="productLink">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Product Link</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      placeholder="https://example.com/product"
                      disabled={isLoading || isReadOnly}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        field.handleChange(
                          nextValue.length > 0 ? nextValue : null,
                        );
                      }}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <FieldSet>
              <FieldLabel htmlFor="tag-select">Tags</FieldLabel>
              <FieldGroup className="flex-col gap-2">
                <AsyncSearchableSelect
                  id="tag-select"
                  value={undefined}
                  onChange={(value) => {
                    const id = Number(value);
                    if (!Number.isFinite(id)) return;
                    if (form.state.values.tagIds.includes(id)) return;
                    form.setFieldValue("tagIds", [
                      ...form.state.values.tagIds,
                      id,
                    ]);
                  }}
                  query={tagSelect.search}
                  onQueryChange={tagSelect.setSearch}
                  options={tagSelect.options}
                  placeholder={
                    tagSelect.isLoading ? "Searching tags…" : "Select tags"
                  }
                  searchPlaceholder="Type to search tags..."
                  className="w-full"
                  isSearching={tagSelect.isLoading}
                  error={tagSelect.isError ? "Failed to load tags" : null}
                  disabled={isLoading || isReadOnly}
                />
              </FieldGroup>
            </FieldSet>

            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() =>
                      !isReadOnly &&
                      form.setFieldValue(
                        "tagIds",
                        form.state.values.tagIds.filter((id) => id !== tag.id),
                      )
                    }
                    className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                    disabled={isReadOnly}
                  >
                    <span className="mr-1">{tag.name}</span>
                    {!isReadOnly && <span aria-hidden>×</span>}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Preview panel */}
        <div className="hidden lg:block lg:w-1/2 p-8 overflow-y-auto bg-muted/30">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground border-b pb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Preview
            </div>

            {/* Image Preview Gallery-style */}
            {currentPreviews.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Images
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {currentPreviews.map((src, index) => (
                    <div
                      key={src + index}
                      className="relative aspect-video rounded-lg overflow-hidden bg-gray-200"
                    >
                      <img
                        src={src}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Add images to see the preview here.
              </div>
            )}

            {/* Title Preview */}
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Title
              </h4>
              <h2 className="text-2xl font-bold text-gray-900">
                {form.state.values.title || (
                  <span className="text-gray-400 italic">Enter a title...</span>
                )}
              </h2>
            </div>

            {/* Overview Preview */}
            {form.state.values.overview && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Overview
                </h4>
                <p className="text-gray-600">{form.state.values.overview}</p>
              </div>
            )}

            {/* Tags Preview */}
            {selectedTags.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Product Link Preview */}
            {form.state.values.productLink && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Product Link
                </h4>
                <a
                  href={form.state.values.productLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm break-all"
                >
                  {form.state.values.productLink}
                </a>
              </div>
            )}

            {/* Description Preview */}
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Description
              </h4>
              {form.state.values.description ? (
                <div className="prose prose-sm max-w-none text-gray-700">
                  <LexicalViewer content={form.state.values.description} />
                </div>
              ) : (
                <p className="text-gray-400 italic text-sm">
                  Write a description...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
