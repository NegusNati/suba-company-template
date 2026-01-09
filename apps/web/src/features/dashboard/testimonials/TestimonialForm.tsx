import { type FormValidateOrFn } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { infer as ZodInfer } from "zod";

import {
  useCreateTestimonialMutation,
  useDeleteTestimonialMutation,
  useUpdateTestimonialMutation,
} from "./lib/testimonials-query";
import {
  createTestimonialFormSchema as createTestimonialSchema,
  updateTestimonialFormSchema as updateTestimonialSchema,
  type Testimonial,
  type TestimonialUpdatePayload,
} from "./lib/testimonials-schema";
import { AsyncSearchableSelect } from "../components/AsyncSearchableSelect";
import type { Partner } from "../partners/lib/partners-schema";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";
import { DEFAULT_DEBOUNCE_MS, useDashboardForm } from "@/lib/forms";
import { toastApiError } from "@/lib/toast";
import { useAsyncSelect, type BaseOption } from "@/lib/useAsyncSelect";
import { useUploadField } from "@/lib/useUploadField";

const createTestimonialFormSchema = createTestimonialSchema.omit({
  companyLogo: true,
  spokePersonHeadshot: true,
});
const updateTestimonialFormSchema = updateTestimonialSchema.omit({
  companyLogo: true,
  spokePersonHeadshot: true,
});
type TestimonialFormValues = ZodInfer<typeof createTestimonialFormSchema>;

type FormMode = "create" | "edit" | "view";

interface TestimonialFormProps {
  mode?: FormMode;
  testimonial?: Testimonial | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function TestimonialForm({
  mode = "create",
  testimonial,
  onClose,
  onSuccess,
}: TestimonialFormProps) {
  const navigate = useNavigate();

  const companyLogoUpload = useUploadField({
    accept: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    initialUrls: testimonial?.companyLogoUrl
      ? [testimonial.companyLogoUrl]
      : [],
  });

  const headshotUpload = useUploadField({
    accept: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    initialUrls: testimonial?.spokePersonHeadshotUrl
      ? [testimonial.spokePersonHeadshotUrl]
      : [],
  });

  type PartnerOption = BaseOption & Partner;

  const partnerSelect = useAsyncSelect<PartnerOption>({
    queryKey: (search) => [AUTH_API_ENDPOINTS.PARTNER, "select", search],
    queryFn: async (search) => {
      const { data } = await apiClient.get<{ data: Partner[] }>(
        AUTH_API_ENDPOINTS.PARTNER,
        {
          params: { page: 1, limit: 20, search: search || undefined },
        },
      );
      return (data.data ?? []).map((partner) => ({
        ...partner,
        label: partner.title,
        value: partner.id,
      }));
    },
    debounceMs: DEFAULT_DEBOUNCE_MS,
  });

  const createMutation = useCreateTestimonialMutation({
    onSuccess: () => {
      toast.success("Testimonial created successfully!");
      onSuccess?.();
      onClose?.();
      navigate({ to: "/dashboard/testimonials" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to create testimonial");
    },
  });

  const updateMutation = useUpdateTestimonialMutation({
    onSuccess: () => {
      toast.success("Testimonial updated successfully!");
      onSuccess?.();
      onClose?.();
      navigate({ to: "/dashboard/testimonials" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to update testimonial");
    },
  });

  const deleteMutation = useDeleteTestimonialMutation({
    onSuccess: () => {
      toast.success("Testimonial deleted successfully!");
      onSuccess?.();
      onClose?.();
      navigate({ to: "/dashboard/testimonials" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to delete testimonial");
    },
  });

  const isLoading =
    mode === "create"
      ? createMutation.isPending
      : mode === "edit"
        ? updateMutation.isPending
        : false;

  const form = useDashboardForm<TestimonialFormValues>({
    defaultValues: {
      comment: testimonial?.comment ?? "",
      companyName: testimonial?.companyName ?? "",
      spokePersonName: testimonial?.spokePersonName ?? "",
      spokePersonTitle: testimonial?.spokePersonTitle ?? "",
      partnerId: testimonial?.partnerId ?? undefined,
    } satisfies TestimonialFormValues,
    validators: {
      onSubmit: (mode === "create"
        ? createTestimonialFormSchema
        : updateTestimonialFormSchema) as FormValidateOrFn<TestimonialFormValues>,
    },
    onSubmit: async ({ value }) => {
      if (mode === "view") return;

      if (mode === "create") {
        await createMutation.mutateAsync({
          comment: value.comment,
          companyName: value.companyName,
          spokePersonName: value.spokePersonName || undefined,
          spokePersonTitle: value.spokePersonTitle || undefined,
          partnerId: value.partnerId,
          companyLogo: companyLogoUpload.files[0],
          spokePersonHeadshot: headshotUpload.files[0],
        });
      } else if (mode === "edit" && testimonial) {
        const payload: TestimonialUpdatePayload = {
          comment: value.comment,
          companyName: value.companyName,
          spokePersonName: value.spokePersonName || undefined,
          spokePersonTitle: value.spokePersonTitle || undefined,
          partnerId: value.partnerId,
        };

        if (companyLogoUpload.files[0]) {
          payload.companyLogo = companyLogoUpload.files[0];
        }

        if (headshotUpload.files[0]) {
          payload.spokePersonHeadshot = headshotUpload.files[0];
        }

        await updateMutation.mutateAsync({
          id: testimonial.id,
          payload,
        });
      }
      companyLogoUpload.reset();
      headshotUpload.reset();
    },
  });

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
        <form.Field name="comment">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Comment</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="What did the client say?"
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

        <form.Field name="companyName">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Company Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="Acme Inc."
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="spokePersonName">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Spokesperson Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="Jane Doe"
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="spokePersonTitle">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Spokesperson Title</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="CTO"
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            )}
          </form.Field>
        </div>

        <form.Field name="partnerId">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Linked Partner</FieldLabel>
              <AsyncSearchableSelect
                id="partner-select"
                value={field.state.value}
                onChange={(val) => field.handleChange(Number(val))}
                query={partnerSelect.search}
                onQueryChange={partnerSelect.setSearch}
                options={partnerSelect.options}
                placeholder={
                  partnerSelect.isLoading
                    ? "Searching partners…"
                    : "Select partner"
                }
                searchPlaceholder="Type to search partners..."
                className="w-full"
                isSearching={partnerSelect.isLoading}
                error={partnerSelect.isError ? "Failed to load partners" : null}
                disabled={isReadOnly || isLoading}
              />
            </Field>
          )}
        </form.Field>

        <Field>
          <FieldLabel>Company Logo</FieldLabel>
          <Input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={(e) => {
              if (!e.target.files) return;
              const { errors } = companyLogoUpload.handleFiles(e.target.files);
              if (errors.length) toast.error(errors.join("\n"));
            }}
            disabled={isReadOnly || isLoading}
          />
          {companyLogoUpload.previews[0] && (
            <div className="mt-2">
              <img
                src={companyLogoUpload.previews[0]}
                alt="Company logo preview"
                className="h-16 w-auto rounded border object-contain"
              />
            </div>
          )}
        </Field>

        <Field>
          <FieldLabel>Spokesperson Headshot</FieldLabel>
          <Input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => {
              if (!e.target.files) return;
              const { errors } = headshotUpload.handleFiles(e.target.files);
              if (errors.length) toast.error(errors.join("\n"));
            }}
            disabled={isReadOnly || isLoading}
          />
          {headshotUpload.previews[0] && (
            <div className="mt-2">
              <img
                src={headshotUpload.previews[0]}
                alt="Spokesperson headshot preview"
                className="h-16 w-16 rounded-full border object-cover"
              />
            </div>
          )}
        </Field>

        <div className="flex justify-end gap-2">
          {mode === "view" && testimonial && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteMutation.mutate(testimonial.id)}
              disabled={isLoading}
            >
              Delete
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onClose?.() ?? navigate({ to: "/dashboard/testimonials" })
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
                      ? "Create Testimonial"
                      : "Update Testimonial"}
                </Button>
              )}
            />
          )}
        </div>
      </FieldGroup>
    </form>
  );
}
