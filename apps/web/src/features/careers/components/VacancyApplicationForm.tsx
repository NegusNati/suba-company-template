import { DOCUMENT_MIME_ACCEPT } from "@suba-company-template/types";
import type { FormValidateOrFn } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";

import { useSubmitVacancyApplicationMutation } from "../lib/careers-query";
import {
  vacancyApplicationFormSchema,
  type VacancyApplicationFormValues,
} from "../lib/careers-schema";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDashboardForm } from "@/lib/forms";

type Props = {
  vacancyId: number;
  disabled?: boolean;
};

export function VacancyApplicationForm({ vacancyId, disabled }: Props) {
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useSubmitVacancyApplicationMutation({
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      setSubmitted(true);
    },
    onError: (error) =>
      toast.error(`Failed to submit application: ${error.message}`),
  });

  const form = useDashboardForm<VacancyApplicationFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      resume: undefined,
      portfolioUrl: "",
      linkedinUrl: "",
      coverLetter: "",
      consent: false,
      honeypot: "",
    },
    validators: {
      onSubmit:
        vacancyApplicationFormSchema as unknown as FormValidateOrFn<VacancyApplicationFormValues>,
    },
    onSubmit: async ({ value }) => {
      if (disabled) return;

      await submitMutation.mutateAsync({
        vacancyId,
        payload: {
          ...value,
          // Ensure real submissions keep honeypot empty
          honeypot: "",
        },
      });
    },
  });

  if (submitted) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
        <h3 className="text-lg font-semibold">Thanks for applying!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ve received your application and will get back to you if
          there&apos;s a match.
        </p>
      </div>
    );
  }

  const isLoading = submitMutation.isPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className="space-y-6"
    >
      <FieldSet>
        <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <form.Field name="fullName">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={disabled || isLoading}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    type="email"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={disabled || isLoading}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <form.Field name="phone">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Phone (optional)</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={disabled || isLoading}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="resume">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              const filename =
                field.state.value instanceof File ? field.state.value.name : "";

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Resume (optional)
                  </FieldLabel>
                  <Input
                    id={field.name}
                    type="file"
                    accept={DOCUMENT_MIME_ACCEPT}
                    onChange={(e) =>
                      field.handleChange(e.target.files?.[0] || undefined)
                    }
                    disabled={disabled || isLoading}
                    aria-invalid={isInvalid}
                  />
                  {filename && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {filename}
                    </p>
                  )}
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <form.Field name="linkedinUrl">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    LinkedIn (optional)
                  </FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={disabled || isLoading}
                    placeholder="https://linkedin.com/in/..."
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="portfolioUrl">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Portfolio (optional)
                  </FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={disabled || isLoading}
                    placeholder="https://..."
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <form.Field name="coverLetter">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                Cover letter (optional)
              </FieldLabel>
              <Textarea
                id={field.name}
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={disabled || isLoading}
                rows={5}
                placeholder="Tell us why you're a great fit..."
              />
            </Field>
          )}
        </form.Field>
      </FieldSet>

      <FieldSet>
        <form.Field name="consent">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid} orientation="horizontal">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={Boolean(field.state.value)}
                    onCheckedChange={(checked) =>
                      field.handleChange(Boolean(checked))
                    }
                    disabled={disabled || isLoading}
                  />
                  <div className="text-sm text-muted-foreground">
                    I consent to having my data processed for recruitment
                    purposes.
                  </div>
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </FieldSet>

      {/* Honeypot field - hidden from users */}
      <div className="hidden">
        <form.Field name="honeypot">
          {(field) => (
            <Input
              value={field.state.value ?? ""}
              onChange={(e) => field.handleChange(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          )}
        </form.Field>
      </div>

      <Button type="submit" disabled={disabled || isLoading} className="w-full">
        {isLoading ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
}
