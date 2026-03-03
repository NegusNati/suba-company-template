import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { z } from "zod";

import {
  useCreateGalleryCategoryMutation,
  useDeleteGalleryCategoryMutation,
  useUpdateGalleryCategoryMutation,
} from "./lib";
import { createGalleryCategorySchema, type GalleryCategory } from "./lib";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useDashboardForm } from "@/lib/forms";
import { toastApiError } from "@/lib/toast";

type FormMode = "create" | "edit" | "view";

interface GalleryCategoryFormProps {
  mode: FormMode;
  category?: GalleryCategory | null;
  onClose: () => void;
  onSuccess?: () => void;
}

type FormData = z.infer<typeof createGalleryCategorySchema>;

export function CategoryForm({
  mode,
  category,
  onClose,
  onSuccess,
}: GalleryCategoryFormProps) {
  const createMutation = useCreateGalleryCategoryMutation({
    onSuccess: () => {
      toast.success("Gallery category created successfully!");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toastApiError(error, "Failed to create gallery category");
    },
  });

  const updateMutation = useUpdateGalleryCategoryMutation({
    onSuccess: () => {
      toast.success("Gallery category updated successfully!");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toastApiError(error, "Failed to update gallery category");
    },
  });

  const deleteMutation = useDeleteGalleryCategoryMutation({
    onSuccess: () => {
      toast.success("Gallery category deleted successfully!");
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toastApiError(error, "Failed to delete gallery category");
    },
  });

  const form = useDashboardForm<FormData>({
    defaultValues: {
      name: "",
    } satisfies FormData,
    validators: {
      onSubmit: createGalleryCategorySchema,
    },
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        createMutation.mutate(value);
      } else if (mode === "edit" && category) {
        updateMutation.mutate({ id: category.id, payload: value });
      }
    },
  });

  useEffect(() => {
    if (category && (mode === "edit" || mode === "view")) {
      form.setFieldValue("name", category.name);
    } else if (mode === "create") {
      form.reset();
    }
  }, [category, form, mode]);

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;
  const isReadOnly = mode === "view";

  const handleDelete = () => {
    if (!category || category.isSystem) return;
    deleteMutation.mutate(category.id);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
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
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Enter category name"
                  disabled={isReadOnly || isLoading || category?.isSystem}
                  aria-invalid={isInvalid}
                />
                {category?.slug && (
                  <FieldDescription>Slug: {category.slug}</FieldDescription>
                )}
                {category?.isSystem && (
                  <FieldDescription>
                    This is a protected system category.
                  </FieldDescription>
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <div className="flex justify-end space-x-2">
          {mode === "view" && (
            <>
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
              {!category?.isSystem && (
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
              )}
            </>
          )}

          {mode !== "view" && (
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
              >
                {([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting || isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {mode === "create" ? "Creating..." : "Updating..."}
                      </>
                    ) : mode === "create" ? (
                      "Create Category"
                    ) : (
                      "Update Category"
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </>
          )}
        </div>
      </FieldGroup>
    </form>
  );
}

export { CategoryForm as GalleryCategoryForm };
