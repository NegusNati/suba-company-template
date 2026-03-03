import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { infer as ZodInfer } from "zod";

import {
  useCreateFaqMutation,
  useDeleteFaqMutation,
  useUpdateFaqMutation,
} from "./lib/faqs-query";
import { createFaqSchema, type Faq } from "./lib/faqs-schema";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useDashboardForm } from "@/lib/forms";
import { toastApiError } from "@/lib/toast";

type FormMode = "create" | "edit" | "view";

interface FaqFormProps {
  mode: FormMode;
  faq?: Faq | null;
  onClose: () => void;
  onSuccess?: () => void;
}

type FormData = ZodInfer<typeof createFaqSchema>;

const createDefaultValues = (): FormData => ({
  question: "",
  answer: "",
  isActive: true,
});

export function FaqForm({ mode, faq, onClose, onSuccess }: FaqFormProps) {
  // Create, Update, and Delete mutations
  const createMutation = useCreateFaqMutation({
    onSuccess: () => {
      toast.success("FAQ created successfully!");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toastApiError(error, "Failed to create FAQ");
    },
  });

  const updateMutation = useUpdateFaqMutation({
    onSuccess: () => {
      toast.success("FAQ updated successfully!");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toastApiError(error, "Failed to update FAQ");
    },
  });

  const deleteMutation = useDeleteFaqMutation({
    onSuccess: () => {
      toast.success("FAQ deleted successfully!");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toastApiError(error, "Failed to delete FAQ");
    },
  });

  // TanStack Form hook setup
  const form = useDashboardForm<FormData>({
    defaultValues: createDefaultValues(),
    validators: {
      onSubmit: createFaqSchema,
    },
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        createMutation.mutate(value);
      } else if (mode === "edit" && faq) {
        updateMutation.mutate({ ...value, id: faq.id });
      }
    },
  });

  const faqId = faq?.id;
  const faqQuestion = faq?.question ?? "";
  const faqAnswer = faq?.answer ?? "";
  const faqIsActive = faq?.isActive ?? true;

  // Reset form when modal mode or active entity changes.
  useEffect(() => {
    if (faqId && (mode === "edit" || mode === "view")) {
      form.reset({
        question: faqQuestion,
        answer: faqAnswer,
        isActive: faqIsActive,
      });
    } else if (mode === "create") {
      form.reset(createDefaultValues());
    }
  }, [faqId, faqQuestion, faqAnswer, faqIsActive, mode, form]);

  const handleDelete = () => {
    if (faq) {
      deleteMutation.mutate(faq.id);
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
        <form.Field name="question">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Question</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="Enter FAQ question"
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="answer">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Answer</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="Enter FAQ answer"
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="isActive">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.name}
                    checked={field.state.value as boolean}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked as boolean)
                    }
                    disabled={isReadOnly || isLoading}
                  />
                  <FieldLabel htmlFor={field.name}>Active</FieldLabel>
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

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
                      "Create FAQ"
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
                      "Update FAQ"
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
