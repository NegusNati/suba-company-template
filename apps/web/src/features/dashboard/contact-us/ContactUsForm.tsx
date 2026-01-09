import { type FormValidateOrFn } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  useDeleteContactMutation,
  useSubmitContactMutation,
  useUpdateContactMutation,
} from "./lib/contact-query";
import {
  createContactSchema,
  updateContactSchema,
  type Contact,
  type CreateContact,
} from "./lib/contact-schema";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDashboardForm } from "@/lib/forms";
import { toastApiError } from "@/lib/toast";

type FormMode = "create" | "edit" | "view";

interface ContactUsFormProps {
  mode?: FormMode;
  contactUs?: Contact | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function ContactUsForm({
  mode = "create",
  contactUs,
  onClose,
  onSuccess,
}: ContactUsFormProps) {
  const navigate = useNavigate();

  const createMutation = useSubmitContactMutation({
    onSuccess: () => {
      toast.success("Contact created successfully!");
      onSuccess?.();
      onClose?.();
      navigate({ to: "/dashboard/contact-us" });
    },
    onError: (error: Error) => {
      toastApiError(error, "Failed to create contact");
    },
  });

  const updateMutation = useUpdateContactMutation({
    onSuccess: () => {
      toast.success("Contact updated successfully!");
      onSuccess?.();
      onClose?.();
      navigate({ to: "/dashboard/contact-us" });
    },
    onError: (error: Error) => {
      toastApiError(error, "Failed to update contact");
    },
  });

  const deleteMutation = useDeleteContactMutation({
    onSuccess: () => {
      toast.success("Contact deleted successfully!");
      onSuccess?.();
      onClose?.();
      navigate({ to: "/dashboard/contact-us" });
    },
    onError: (error: Error) => {
      toastApiError(error, "Failed to delete contact");
    },
  });

  const isLoading =
    mode === "create"
      ? createMutation.isPending
      : mode === "edit"
        ? updateMutation.isPending
        : false;

  type ContactFormValues = Omit<CreateContact, "serviceId"> & {
    serviceId: number | null;
    isHandled: boolean;
  };

  const form = useDashboardForm<ContactFormValues>({
    defaultValues: {
      fullName: contactUs?.fullName ?? "",
      contact: contactUs?.contact ?? "",
      message: contactUs?.message ?? "",
      serviceId: contactUs?.serviceId ?? null,
      isHandled: contactUs?.isHandled ?? false,
    } satisfies ContactFormValues,
    validators: {
      onSubmit: (mode === "create"
        ? createContactSchema
        : updateContactSchema) as FormValidateOrFn<ContactFormValues>,
    },
    onSubmit: async ({ value }) => {
      if (mode === "view") return;

      if (mode === "create") {
        await createMutation.mutateAsync({
          fullName: value.fullName,
          contact: value.contact,
          message: value.message,
          serviceId: value.serviceId ?? null,
        });
      } else if (mode === "edit" && contactUs) {
        await updateMutation.mutateAsync({
          id: contactUs.id,
          data: {
            fullName: value.fullName,
            contact: value.contact,
            message: value.message,
            serviceId: value.serviceId ?? null,
            isHandled: value.isHandled,
          },
        });
      }
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
        <form.Field name="fullName">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="Enter full name"
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="contact">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Contact</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="Enter contact information"
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="message">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Message</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="Enter message"
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

        <form.Field name="serviceId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Service ID</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  placeholder="Enter service ID"
                  disabled={isReadOnly || isLoading}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        {mode !== "create" && (
          <form.Field name="isHandled">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Handled</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="checkbox"
                  checked={field.state.value ?? false}
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.checked)}
                />
              </Field>
            )}
          </form.Field>
        )}

        <div className="flex justify-end gap-2">
          {mode === "view" && contactUs && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteMutation.mutate(contactUs.id)}
              disabled={isLoading}
            >
              Delete
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onClose?.() ?? navigate({ to: "/dashboard/contact-us" })
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
                      ? "Create Contact"
                      : "Update Contact"}
                </Button>
              )}
            />
          )}
        </div>
      </FieldGroup>
    </form>
  );
}
