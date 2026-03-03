import { type FormValidateOrFn } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { infer as ZodInfer } from "zod";

import {
  useCreatePartnerMutation,
  useDeletePartnerMutation,
  useUpdatePartnerMutation,
} from "./lib/partners-query";
import {
  updatePartnerFormSchema,
  type Partner,
  type PartnerUpdatePayload,
} from "./lib/partners-schema";

import { AppImage } from "@/components/common/AppImage";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/lib/api-base";
import { useDashboardForm } from "@/lib/forms";
import { toastApiError } from "@/lib/toast";
import { useUploadField } from "@/lib/useUploadField";

const partnerFormSchema = updatePartnerFormSchema.omit({ logo: true });
type PartnerFormValues = ZodInfer<typeof partnerFormSchema>;

type FormMode = "create" | "edit" | "view";

interface PartnerFormProps {
  mode?: FormMode;
  partner?: Partner | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function PartnerForm({
  mode = "create",
  partner,
  onClose,
  onSuccess,
}: PartnerFormProps) {
  const navigate = useNavigate();
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  const resolveImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return null;
    return imageUrl.startsWith("/") ? `${baseUrl}${imageUrl}` : imageUrl;
  };
  const existingLogo = resolveImageUrl(partner?.logoUrl ?? null);

  const {
    files,
    previews,
    handleFiles,
    reset: resetUploads,
  } = useUploadField({
    accept: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    initialUrls: existingLogo ? [existingLogo] : [],
  });

  const createMutation = useCreatePartnerMutation({
    onSuccess: () => {
      toast.success("Partner created successfully!");
      onSuccess?.();
      onClose?.();
      navigate({ to: "/dashboard/partners" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to create partner");
    },
  });

  const updateMutation = useUpdatePartnerMutation({
    onSuccess: () => {
      toast.success("Partner updated successfully!");
      onSuccess?.();
      onClose?.();
      navigate({ to: "/dashboard/partners" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to update partner");
    },
  });

  const deleteMutation = useDeletePartnerMutation({
    onSuccess: () => {
      toast.success("Partner deleted successfully!");
      onSuccess?.();
      onClose?.();
      navigate({ to: "/dashboard/partners" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to delete partner");
    },
  });

  const isLoading =
    mode === "create"
      ? createMutation.isPending
      : mode === "edit"
        ? updateMutation.isPending
        : false;

  const form = useDashboardForm<PartnerFormValues>({
    defaultValues: {
      title: partner?.title ?? "",
      description: partner?.description ?? "",
      websiteUrl: partner?.websiteUrl ?? "",
    } satisfies PartnerFormValues,
    validators: {
      onSubmit: (mode === "create"
        ? partnerFormSchema
        : partnerFormSchema) as FormValidateOrFn<PartnerFormValues>,
    },
    onSubmit: async ({ value }) => {
      if (mode === "view") return;

      if (mode === "create") {
        const logo = files[0];
        if (!logo) {
          toast.error("Please upload a logo");
          return;
        }
        createMutation.mutate({ ...value, logo });
      } else if (mode === "edit" && partner) {
        const payload: PartnerUpdatePayload = {
          title: value.title,
          description: value.description,
          websiteUrl: value.websiteUrl,
        };
        if (files[0]) {
          payload.logo = files[0];
        }
        updateMutation.mutate({
          id: partner.id,
          payload,
        });
      }
      resetUploads();
    },
  });

  const isReadOnly = mode === "view";
  const currentLogo = previews[0] ?? existingLogo ?? null;

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
                  placeholder="Enter partner title"
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="Enter partner description"
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  rows={4}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="websiteUrl">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Website URL</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="https://example.com"
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <Field>
          <FieldLabel>Logo</FieldLabel>
          <Input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={(e) => {
              if (!e.target.files) return;
              const { errors } = handleFiles(e.target.files);
              if (errors.length) toast.error(errors.join("\n"));
            }}
            disabled={isReadOnly || isLoading}
          />
          {currentLogo && (
            <div className="mt-2 flex items-center gap-3">
              <AppImage
                src={currentLogo}
                alt="Partner logo preview"
                className="h-12 w-12 object-contain rounded border"
              />
              <span className="text-xs text-muted-foreground">
                Preview (first image used as logo)
              </span>
            </div>
          )}
        </Field>

        <div className="flex justify-end space-x-2">
          {mode === "view" && partner && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteMutation.mutate(partner.id)}
              disabled={isLoading}
            >
              Delete
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onClose?.() ?? navigate({ to: "/dashboard/partners" })
            }
            disabled={isLoading}
          >
            Close
          </Button>
          {mode !== "view" && (
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting || isLoading
                    ? mode === "create"
                      ? "Creating..."
                      : "Updating..."
                    : mode === "create"
                      ? "Create Partner"
                      : "Update Partner"}
                </Button>
              )}
            />
          )}
        </div>
      </FieldGroup>
    </form>
  );
}
