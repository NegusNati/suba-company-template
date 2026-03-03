import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { z } from "zod";

import {
  useCreateTagMutation,
  useDeleteTagMutation,
  useUpdateTagMutation,
} from "./lib/tags-query";
import { createTagSchema, type Tag } from "./lib/tags-schema";

import { Button } from "@/components/ui/button";
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

interface TagFormProps {
  mode: FormMode;
  tag?: Tag | null;
  onClose: () => void;
  onSuccess?: () => void;
}

type FormData = z.infer<typeof createTagSchema>;

const createDefaultValues = (): FormData => ({
  name: "",
});

export function TagForm({ mode, tag, onClose, onSuccess }: TagFormProps) {
  const createMutation = useCreateTagMutation({
    onSuccess: () => {
      toast.success("Tag created successfully!");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toastApiError(error, "Failed to create tag");
    },
  });

  const updateMutation = useUpdateTagMutation({
    onSuccess: () => {
      toast.success("Tag updated successfully!");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toastApiError(error, "Failed to update tag");
    },
  });

  const deleteMutation = useDeleteTagMutation({
    onSuccess: () => {
      toast.success("Tag deleted successfully!");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toastApiError(error, "Failed to delete tag");
    },
  });

  // TanStack Form hook setup
  const form = useDashboardForm<FormData>({
    defaultValues: createDefaultValues(),
    validators: {
      onSubmit: createTagSchema,
    },
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        createMutation.mutate(value);
      } else if (mode === "edit" && tag) {
        updateMutation.mutate({ id: tag.id, payload: value });
      }
    },
  });

  const tagId = tag?.id;
  const tagName = tag?.name ?? "";

  // Reset form when modal mode or active entity changes.
  useEffect(() => {
    if (tagId && (mode === "edit" || mode === "view")) {
      form.reset({ name: tagName });
    } else if (mode === "create") {
      form.reset(createDefaultValues());
    }
  }, [tagId, tagName, mode, form]);

  const handleDelete = () => {
    if (tag) {
      deleteMutation.mutate(tag.id);
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
        <form.Field name="name">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Tag Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="Enter tag name"
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
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
                      "Create Tag"
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
                      "Update Tag"
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
