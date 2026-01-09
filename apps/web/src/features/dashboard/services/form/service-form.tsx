import { LexicalEditor } from "@rich-text/LexicalEditor";
import { type FormValidateOrFn } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { infer as ZodInfer } from "zod";

import ServicePreview from "./service-preview";
import {
  useCreateServiceMutation,
  useUpdateServiceMutation,
} from "../lib/services-query";
import {
  createServiceSchema,
  updateServiceSchema,
  type UpdateService,
  type Service,
} from "../lib/services-schema";

import { LexicalViewer } from "@/components/common/rich-text/LexicalViewer";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/lib/api-base";
import { useDashboardForm } from "@/lib/forms";
import { toastApiError } from "@/lib/toast";
import { useUploadField } from "@/lib/useUploadField";

type FormMode = "create" | "edit" | "view";

interface ServiceFormProps {
  mode?: FormMode;
  initialData?: UpdateService;
}

const createServiceFormSchema = createServiceSchema.omit({
  images: true,
  imagesMeta: true,
});
const updateServiceFormSchema = updateServiceSchema.omit({
  images: true,
  imagesMeta: true,
});
type ServiceFormValues = ZodInfer<typeof createServiceFormSchema>;

const resolveImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) return "";
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return imageUrl.startsWith("/") ? `${baseUrl}${imageUrl}` : imageUrl;
};

export function ServiceForm({
  mode = "create",
  initialData,
}: ServiceFormProps) {
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
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    initialUrls: existingImages,
  });

  const createMutation = useCreateServiceMutation({
    onSuccess: () => {
      toast.success("Service created successfully!");
      navigate({ to: "/dashboard/services" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to create service");
    },
  });

  const updateMutation = useUpdateServiceMutation({
    onSuccess: () => {
      toast.success("Service updated successfully!");
      navigate({ to: "/dashboard/services" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to update service");
    },
  });

  const isLoading =
    mode === "create"
      ? createMutation.isPending
      : mode === "edit"
        ? updateMutation.isPending
        : false;

  const form = useDashboardForm<ServiceFormValues>({
    defaultValues: {
      title: initialData?.title || "",
      excerpt: initialData?.excerpt || "",
      description: initialData?.description || "",
    } satisfies ServiceFormValues,
    validators: {
      onSubmit: (mode === "create"
        ? createServiceFormSchema
        : updateServiceFormSchema) as FormValidateOrFn<ServiceFormValues>,
    },
    onSubmit: async ({ value }) => {
      if (mode === "view") return;

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
          excerpt: value.excerpt,
          description: value.description,
          imagesMeta,
          images: uploadFiles,
        });
      } else {
        const serviceId = (initialData as Service | undefined)?.id;
        if (!serviceId) {
          throw new Error("Service ID is required for update");
        }
        await updateMutation.mutateAsync({
          id: serviceId,
          payload: {
            title: value.title,
            excerpt: value.excerpt,
            description: value.description,
            imagesMeta,
            images: uploadFiles.length > 0 ? uploadFiles : undefined,
          },
        });
      }

      resetUploads();
    },
  });

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
            ? "Create Service"
            : mode === "edit"
              ? "Edit Service"
              : "View Service"}
        </h1>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/dashboard/services" })}
          >
            Back
          </Button>
          {mode !== "view" && (
            <Button type="submit" form="service-form" disabled={isLoading}>
              {isLoading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Service"
                  : "Update Service"}
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-1">
        {/* Scrollable form section */}
        <div className="w-full lg:w-1/2 p-8 border-r border-gray-200 overflow-y-auto">
          <form
            id="service-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            {/* Image field */}
            <Field>
              <FieldLabel>Images</FieldLabel>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={(e) => {
                  if (!e.target.files) return;
                  const { errors } = handleFiles(e.target.files);
                  if (errors.length) toast.error(errors.join("\n"));
                }}
                disabled={isLoading || isReadOnly}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload service images (max 10MB each). First image is primary.
              </p>
            </Field>

            <form.Field name="title">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Service Title</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      placeholder="Enter service title"
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

            <form.Field name="excerpt">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Excerpt</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      rows={3}
                      maxLength={255}
                      onBlur={field.handleBlur}
                      placeholder="Enter service excerpt"
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
                        placeholder="Write a detailed service description..."
                      />
                    )}
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </form>
        </div>

        {/* Scrollable preview section */}
        <div className="hidden lg:block lg:w-1/2 p-8 overflow-y-auto bg-muted/30">
          <form.Subscribe
            selector={(state) => ({
              title: state.values.title,
              excerpt: state.values.excerpt,
              description: state.values.description,
            })}
          >
            {(formValues) => (
              <ServicePreview
                title={formValues.title}
                excerpt={formValues.excerpt}
                description={formValues.description}
                imagePreviews={currentPreviews}
              />
            )}
          </form.Subscribe>
        </div>
      </div>
    </div>
  );
}
