import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { UserPreview } from "./user-preview";
import { UserSocialsSection } from "./user-socials";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useRolesQuery,
  useSocialsListQuery,
} from "../lib/users-query";
import { type UpdateUser, type UserSocialInput } from "../lib/users-schema";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardForm } from "@/lib/forms";
import { toastApiError } from "@/lib/toast";

type FormMode = "create" | "edit";

interface UserFormProps {
  mode?: FormMode;
  initialData?: UpdateUser & { id?: string };
}

type UserFormValues = {
  name: string;
  email: string;
  password: string;
  emailVerified: boolean;
  role: "admin" | "blogger" | "user";
  imageUrl: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

export function UserForm({ mode = "create", initialData }: UserFormProps) {
  const navigate = useNavigate();

  // Fetch roles and available socials
  const { data: rolesData } = useRolesQuery();
  const {
    data: socialsData,
    isLoading: socialsLoading,
    isError: socialsError,
  } = useSocialsListQuery();

  // API hooks
  const createMutation = useCreateUserMutation({
    onSuccess: () => {
      toast.success("User created successfully!");
      navigate({ to: "/dashboard/user-management" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to create user");
    },
  });

  const updateMutation = useUpdateUserMutation({
    onSuccess: () => {
      toast.success("User updated successfully!");
      navigate({ to: "/dashboard/user-management" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to update user");
    },
  });

  const isLoading =
    mode === "create" ? createMutation.isPending : updateMutation.isPending;

  // Local state for file previews
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [headshotPreview, setHeadshotPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [headshotFile, setHeadshotFile] = useState<File | null>(null);

  // Local state for socials (only used in edit mode)
  const [socials, setSocials] = useState<UserSocialInput[]>(() => {
    if (mode === "edit" && initialData) {
      // Profile with socials comes from API response, not from UpdateUserInput
      const profile = initialData.profile as {
        socials?: Array<{
          socialId: number;
          handle: string | null;
          fullUrl: string | null;
        }>;
      };
      if (profile?.socials) {
        return profile.socials.map((s) => ({
          socialId: s.socialId,
          handle: s.handle,
          fullUrl: s.fullUrl,
        }));
      }
    }
    return [];
  });

  const form = useDashboardForm<UserFormValues>({
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "",
      emailVerified: initialData?.emailVerified || false,
      role: initialData?.role || ("user" as "admin" | "blogger" | "user"),
      imageUrl: initialData?.imageUrl || "",
      firstName: initialData?.profile?.firstName || "",
      lastName: initialData?.profile?.lastName || "",
      phoneNumber: initialData?.profile?.phoneNumber || "",
    },
    // Validation happens at the API level
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        await createMutation.mutateAsync({
          name: value.name,
          email: value.email,
          password: value.password,
          emailVerified: value.emailVerified,
          role: value.role,
          imageUrl: value.imageUrl || undefined,
          image: avatarFile || undefined,
          profile: {
            firstName: value.firstName,
            lastName: value.lastName,
            phoneNumber: value.phoneNumber,
          },
          profileHeadshot: headshotFile || undefined,
        });
      } else {
        const userId = (initialData as typeof initialData & { id?: string })
          ?.id;
        if (!userId) {
          throw new Error("User ID is required for update");
        }

        // Only send imageUrl if it has a value AND we're not uploading a new file
        const shouldSendImageUrl = value.imageUrl && !avatarFile;

        await updateMutation.mutateAsync({
          id: userId,
          payload: {
            name: value.name,
            email: value.email,
            emailVerified: value.emailVerified,
            role: value.role,
            ...(shouldSendImageUrl && { imageUrl: value.imageUrl }),
            image: avatarFile || undefined,
            profile: {
              firstName: value.firstName,
              lastName: value.lastName,
              phoneNumber: value.phoneNumber,
            },
            profileHeadshot: headshotFile || undefined,
            socials,
          },
        });
      }
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeadshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeadshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeadshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-8 flex items-center justify-between border-b border-gray-200 sticky top-0 left-0 right-0 bg-white">
        <h1 className="text-2xl font-bold">
          {mode === "create" ? "Create" : "Update"} User
        </h1>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => form.reset()}>
            Discard Changes
          </Button>
          <Button type="submit" form="user-form" disabled={isLoading}>
            {isLoading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
                ? "Create User"
                : "Update User"}
          </Button>
        </div>
      </div>
      <div className="flex flex-1">
        {/* Scrollable form section */}
        <div className="w-1/2 p-8 border-r border-gray-200 overflow-y-auto">
          <form
            id="user-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
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
                      placeholder="Enter user name"
                      disabled={isLoading}
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

            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      placeholder="Enter email address"
                      disabled={isLoading}
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

            {mode === "create" && (
              <form.Field name="password">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        placeholder="Enter password (min 8 characters)"
                        disabled={isLoading}
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
            )}

            <form.Field name="role">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(
                          value as "admin" | "blogger" | "user",
                        )
                      }
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {rolesData?.data?.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="emailVerified">
              {(field) => (
                <Field>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={(checked) =>
                        field.handleChange(checked === true)
                      }
                      disabled={isLoading}
                    />
                    <FieldLabel htmlFor={field.name} className="!mb-0">
                      Email Verified
                    </FieldLabel>
                  </div>
                </Field>
              )}
            </form.Field>

            <Field>
              <FieldLabel>Avatar Image</FieldLabel>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                disabled={isLoading}
              />
              {avatarPreview && (
                <div className="mt-2">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                </div>
              )}
            </Field>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Profile Information
              </h3>

              <div className="space-y-6">
                <form.Field name="firstName">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        placeholder="Enter first name"
                        disabled={isLoading}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="lastName">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Last Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        placeholder="Enter last name"
                        disabled={isLoading}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="phoneNumber">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Phone Number
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          placeholder="Enter phone number"
                          disabled={isLoading}
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

                <Field>
                  <FieldLabel>Profile Headshot</FieldLabel>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleHeadshotChange}
                    disabled={isLoading}
                  />
                  {headshotPreview && (
                    <div className="mt-2">
                      <img
                        src={headshotPreview}
                        alt="Headshot preview"
                        className="h-32 w-32 rounded object-cover"
                      />
                    </div>
                  )}
                </Field>
              </div>
            </div>

            {/* Social Links Section - Only in edit mode */}
            {mode === "edit" && (
              <UserSocialsSection
                socials={socials}
                existingSocials={
                  (
                    initialData?.profile as {
                      socials?: Array<{
                        socialId: number;
                        handle: string | null;
                        fullUrl: string | null;
                        socialTitle: string;
                        socialIconUrl: string | null;
                        socialBaseUrl: string;
                      }>;
                    }
                  )?.socials || []
                }
                availableSocials={socialsData}
                isLoading={socialsLoading}
                isError={socialsError}
                disabled={isLoading}
                onAdd={(socialId) => {
                  setSocials([
                    ...socials,
                    { socialId, handle: null, fullUrl: null },
                  ]);
                }}
                onRemove={(index) => {
                  setSocials(socials.filter((_, i) => i !== index));
                }}
                onChange={(index, field, value) => {
                  const updated = [...socials];
                  updated[index] = {
                    ...updated[index],
                    [field]: value || null,
                  };
                  setSocials(updated);
                }}
              />
            )}
          </form>
        </div>

        {/* Scrollable preview section */}
        <div className="w-1/2 p-8 overflow-y-auto">
          <form.Subscribe
            selector={(state) => ({
              name: state.values.name,
              email: state.values.email,
              role: state.values.role,
              emailVerified: state.values.emailVerified,
              firstName: state.values.firstName,
              lastName: state.values.lastName,
              phoneNumber: state.values.phoneNumber,
            })}
          >
            {(formValues) => (
              <UserPreview
                name={formValues.name}
                email={formValues.email}
                role={formValues.role}
                emailVerified={formValues.emailVerified}
                firstName={formValues.firstName}
                lastName={formValues.lastName}
                phoneNumber={formValues.phoneNumber}
                avatarPreview={avatarPreview}
                headshotPreview={headshotPreview}
              />
            )}
          </form.Subscribe>
        </div>
      </div>
    </div>
  );
}
