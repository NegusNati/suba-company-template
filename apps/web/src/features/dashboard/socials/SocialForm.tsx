import { type FormValidateOrFn } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { infer as ZodInfer } from "zod";

import {
  useCreateSocialMutation,
  useDeleteSocialMutation,
  useUpdateSocialMutation,
} from "./lib/socials-query";
import {
  createSocialSchema,
  updateSocialSchema,
  type Social,
} from "./lib/socials-schema";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/lib/api-base";
import {
  ACCEPTED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  useDashboardForm,
} from "@/lib/forms";
import { toastApiError } from "@/lib/toast";
import { useUploadField } from "@/lib/useUploadField";

type FormMode = "create" | "edit" | "view";

interface SocialFormProps {
  mode: FormMode;
  social?: Social | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const socialFormSchema = createSocialSchema.omit({ icon: true });
const updateSocialFormSchema = updateSocialSchema.omit({ icon: true });
type SocialFormValues = ZodInfer<typeof socialFormSchema>;

export function SocialForm({
  mode,
  social,
  onClose,
  onSuccess,
}: SocialFormProps) {
  const resolveImageUrl = (url?: string | null) => {
    if (!url) return null;
    const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
    return url.startsWith("/") ? `${baseUrl}${url}` : url;
  };

  const existingIcon = resolveImageUrl(social?.iconUrl ?? undefined);

  const { files, previews, handleFiles } = useUploadField({
    accept: [...ACCEPTED_IMAGE_MIME_TYPES],
    maxSize: MAX_IMAGE_SIZE_BYTES,
    multiple: false,
    initialUrls: existingIcon ? [existingIcon] : [],
  });

  const createMutation = useCreateSocialMutation({
    onSuccess: () => {
      toast.success("Social created successfully!");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toastApiError(error, "Failed to create social");
    },
  });

  const updateMutation = useUpdateSocialMutation({
    onSuccess: () => {
      toast.success("Social updated successfully!");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toastApiError(error, "Failed to update social");
    },
  });

  const deleteMutation = useDeleteSocialMutation({
    onSuccess: () => {
      toast.success("Social deleted successfully!");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toastApiError(error, "Failed to delete social");
    },
  });

  // TanStack Form hook setup
  const form = useDashboardForm<SocialFormValues>({
    defaultValues: {
      title: "",
      baseUrl: "",
    } satisfies SocialFormValues,
    validators: {
      onSubmit: (mode === "create"
        ? socialFormSchema
        : updateSocialFormSchema) as FormValidateOrFn<SocialFormValues>,
    },
    onSubmit: async ({ value }) => {
      const selectedFile = files[0];

      if (mode === "create") {
        if (!selectedFile) {
          toast.error("Icon is required");
          return;
        }

        createMutation.mutate({
          title: value.title,
          baseUrl: value.baseUrl,
          icon: selectedFile,
        });
      } else if (mode === "edit" && social) {
        updateMutation.mutate({
          id: social.id,
          title: value.title,
          baseUrl: value.baseUrl,
          icon: selectedFile,
        });
      }
    },
  });

  // Effect to update form when social prop changes (for edit/view modes)
  useEffect(() => {
    if (social && (mode === "edit" || mode === "view")) {
      form.setFieldValue("title", social.title);
      form.setFieldValue("baseUrl", social.baseUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [social?.id, mode]);

  const handleDelete = () => {
    if (social) {
      deleteMutation.mutate(social.id);
    }
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;
  const isReadOnly = mode === "view";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <FieldGroup>
        <form.Field name="title">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="Enter social title (e.g., Facebook, Twitter)"
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="baseUrl">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Base URL</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="Enter base URL (e.g., https://facebook.com)"
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        {mode !== "view" && (
          <Field>
            <FieldLabel>Icon</FieldLabel>
            <Input
              type="file"
              accept={ACCEPTED_IMAGE_MIME_TYPES.join(",")}
              disabled={isLoading}
              onChange={(e) => {
                const result = handleFiles(e.target.files ?? []);
                if (result.errors.length) {
                  toast.error(result.errors.join(", "));
                }
              }}
            />
            {(previews.length > 0 || existingIcon) && (
              <div className="mt-2">
                <img
                  src={previews[0] ?? existingIcon ?? ""}
                  alt="Current icon"
                  className="h-12 w-12 object-contain"
                />
              </div>
            )}
          </Field>
        )}
        {mode === "view" && social?.iconUrl && (
          <Field>
            <FieldLabel>Current Icon</FieldLabel>
            <div className="mt-2">
              <img
                src={resolveImageUrl(social.iconUrl) ?? ""}
                alt={social.title}
                className="h-12 w-12 object-contain"
              />
            </div>
          </Field>
        )}

        <div className="flex justify-end space-x-2">
          {mode === "view" && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </>
          )}

          {mode === "create" && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting || createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Social"
                    )}
                  </Button>
                )}
              />
            </>
          )}

          {mode === "edit" && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting || updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Social"
                    )}
                  </Button>
                )}
              />
            </>
          )}
        </div>
      </FieldGroup>
    </form>
  );
}
