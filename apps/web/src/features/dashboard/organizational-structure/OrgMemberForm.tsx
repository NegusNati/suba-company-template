import { type FormValidateOrFn } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import {
  useCreateOrgMemberMutation,
  useOrgMembersQuery,
  useUpdateOrgMemberMutation,
} from "./lib/org-query";
import {
  createOrgMemberSchema,
  type OrgMember,
  type CreateOrgMemberInput,
  type UpdateOrgMemberInput,
  updateOrgMemberSchema,
} from "./lib/org-schema";

import { AppImage } from "@/components/common/AppImage";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL } from "@/lib/api-base";
import { useDashboardForm } from "@/lib/forms";
import { toastApiError } from "@/lib/toast";
import { useUploadField } from "@/lib/useUploadField";

type FormMode = "create" | "edit" | "view";

interface OrgMemberFormProps {
  mode: FormMode;
  member?: OrgMember | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const SERVER_BASE_URL = (API_BASE_URL ?? "").replace(/\/$/, "");

const resolveImageUrl = (imageUrl?: string | null) =>
  imageUrl
    ? imageUrl.startsWith("/")
      ? `${SERVER_BASE_URL}${imageUrl}`
      : imageUrl
    : null;

type FormValues = {
  firstName: string;
  lastName: string;
  title: string;
  managerId: number | null | undefined;
};

export function OrgMemberForm({
  mode,
  member,
  onClose,
  onSuccess,
}: OrgMemberFormProps) {
  // Fetch all org members for manager dropdown
  const { data: orgMembersData } = useOrgMembersQuery(
    {
      limit: 100, // Maximum allowed by schema
    },
    {
      staleTime: 5 * 60 * 1000,
    },
  );

  const allMembers = useMemo(
    () => orgMembersData?.data || [],
    [orgMembersData],
  );

  // Filter out current member in edit mode
  const availableManagers = useMemo(() => {
    if (mode !== "edit" || !member) {
      return allMembers;
    }
    return allMembers.filter((m) => m.id !== member.id);
  }, [allMembers, member, mode]);

  // Use upload field hook for image handling (gallery pattern)
  const resolvedHeadshotUrl = resolveImageUrl(member?.headshotUrl);
  const {
    files,
    previews,
    handleFiles,
    reset: resetFiles,
  } = useUploadField({
    accept: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    initialUrls: resolvedHeadshotUrl ? [resolvedHeadshotUrl] : [],
  });

  // Create and Update mutations
  const createMutation = useCreateOrgMemberMutation({
    onSuccess: () => {
      toast.success("Organization member created successfully!");
      resetFiles();
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toastApiError(error, "Failed to create member");
    },
  });

  const updateMutation = useUpdateOrgMemberMutation({
    onSuccess: () => {
      toast.success("Organization member updated successfully!");
      resetFiles();
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toastApiError(error, "Failed to update member");
    },
  });

  const normalizeManagerId = (managerId: number | null | undefined) => {
    if (managerId === null) return null;
    if (managerId === undefined) return undefined;
    return Number.isFinite(managerId) ? managerId : undefined;
  };

  // TanStack Form hook setup
  const form = useDashboardForm<FormValues>({
    defaultValues: {
      firstName: member?.firstName ?? "",
      lastName: member?.lastName ?? "",
      title: member?.title ?? "",
      managerId: member?.managerId ?? null,
    } as FormValues,
    validators: {
      onSubmit: (mode === "create"
        ? createOrgMemberSchema
        : updateOrgMemberSchema) as FormValidateOrFn<FormValues>,
    },
    onSubmit: async ({ value }) => {
      // Only include image if we have a valid file
      const hasNewImage = files.length > 0 && files[0] instanceof File;

      if (mode === "create") {
        const payload: CreateOrgMemberInput = {
          firstName: value.firstName,
          lastName: value.lastName,
          title: value.title,
          managerId: normalizeManagerId(value.managerId),
          image: hasNewImage ? files[0] : undefined,
        };
        createMutation.mutate(payload);
      } else if (mode === "edit" && member) {
        // For updates: if new file selected, send it; otherwise pass imageUrl to keep existing
        const shouldSendImageUrl = member.headshotUrl && !hasNewImage;

        const payload: UpdateOrgMemberInput = {
          firstName: value.firstName,
          lastName: value.lastName,
          title: value.title,
          managerId: normalizeManagerId(value.managerId),
          image: hasNewImage ? files[0] : undefined,
          imageUrl: shouldSendImageUrl
            ? (member.headshotUrl ?? undefined)
            : undefined,
        };
        updateMutation.mutate({
          id: member.id,
          payload,
        });
      }
    },
  });

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const { errors } = handleFiles(e.target.files);
      if (errors.length) {
        toast.error(errors.join("\n"));
      }
    },
    [handleFiles],
  );

  // Current preview: new file preview or existing resolved URL
  const currentImagePreview = previews[0] ?? null;

  const isLoading = createMutation.isPending || updateMutation.isPending;
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
        <form.Field name="firstName">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="Enter first name"
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="lastName">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Last Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="Enter last name"
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

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
                  placeholder="Enter title/position"
                  disabled={isReadOnly || isLoading}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        {/* Headshot Image Field - Gallery Pattern */}
        <Field>
          <FieldLabel>Headshot</FieldLabel>
          <div className="flex items-start gap-4">
            <div className="flex flex-col gap-2">
              {currentImagePreview ? (
                <AppImage
                  src={currentImagePreview}
                  alt="Org member headshot preview"
                  className="h-20 w-20 rounded-full object-cover border"
                />
              ) : (
                <div className="h-20 w-20 rounded-full border flex items-center justify-center text-xs text-muted-foreground">
                  No Headshot
                </div>
              )}
              {!isReadOnly && (
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  disabled={isLoading}
                  onChange={handleImageChange}
                />
              )}
              <p className="text-sm text-muted-foreground">
                Select an image (JPEG, PNG, GIF, or WebP). Max size: 10MB.
              </p>
            </div>
          </div>
        </Field>

        <form.Field name="managerId" mode="value">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Manager (Optional)</FieldLabel>
                <Select
                  value={
                    field.state.value !== null &&
                    field.state.value !== undefined
                      ? String(field.state.value)
                      : "none"
                  }
                  onValueChange={(value) => {
                    if (value === "none") {
                      field.handleChange(null);
                      return;
                    }

                    const parsed = Number.parseInt(value, 10);
                    field.handleChange(Number.isNaN(parsed) ? null : parsed);
                  }}
                  disabled={isReadOnly || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Manager</SelectItem>
                    {availableManagers.map((manager) => (
                      <SelectItem key={manager.id} value={String(manager.id)}>
                        {manager.firstName} {manager.lastName} - {manager.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <div className="flex justify-end space-x-2">
          {mode === "view" && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Close
            </Button>
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
                      "Create Member"
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
                      "Update Member"
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
