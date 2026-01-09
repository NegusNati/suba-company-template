import { LexicalEditor } from "@rich-text/LexicalEditor";
import { type FormValidateOrFn } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { z } from "zod";

import ClientProjectPreview from "./client-project-preview";
import { AsyncSearchableSelect } from "../../components/AsyncSearchableSelect";
import type { Partner } from "../../partners/lib/partners-schema";
import type { Service } from "../../services/lib/services-schema";
import type { Tag } from "../../tags/lib/tags-schema";
import {
  useCreateClientProjectMutation,
  useUpdateClientProjectMutation,
} from "../lib/client-projects-query";
import {
  createClientProjectSchema,
  type UpdateClientProject,
  type ClientProject,
} from "../lib/client-projects-schema";

import { LexicalViewer } from "@/components/common/rich-text/LexicalViewer";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/lib/api-base";
import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import apiClient from "@/lib/axios";
import { DEFAULT_DEBOUNCE_MS, useDashboardForm } from "@/lib/forms";
import { toastApiError } from "@/lib/toast";
import { useAsyncSelect, type BaseOption } from "@/lib/useAsyncSelect";
import { useUploadField } from "@/lib/useUploadField";

type FormMode = "create" | "edit" | "view";

interface ClientProjectFormProps {
  mode?: FormMode;
  initialData?: UpdateClientProject & { id?: number };
}

const sharedNarrativeFields = {
  impact: z.string(),
  problem: z.string(),
  process: z.string(),
  deliverable: z.string(),
};
const createClientProjectFormSchema = createClientProjectSchema
  .omit({
    images: true,
    imagesMeta: true,
  })
  .extend(sharedNarrativeFields);
const updateClientProjectFormSchema = createClientProjectFormSchema;
type ClientProjectFormValues = z.infer<typeof createClientProjectFormSchema>;

type TagOption = BaseOption & Tag;
type PartnerOption = BaseOption & Partner;
type ServiceOption = BaseOption & Service;

const resolveImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) return "";
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return imageUrl.startsWith("/") ? `${baseUrl}${imageUrl}` : imageUrl;
};

export function ClientProjectForm({
  mode = "create",
  initialData,
}: ClientProjectFormProps) {
  const navigate = useNavigate();

  const existingImages =
    initialData?.existingImages?.map((img) => resolveImageUrl(img.imageUrl)) ??
    [];

  const {
    files: uploadFiles,
    previews,
    handleFiles,
    reset: resetUploads,
  } = useUploadField({
    accept: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    initialUrls: existingImages,
  });

  // Async selects
  const tagSelect = useAsyncSelect<TagOption>({
    queryKey: (search) => [AUTH_API_ENDPOINTS.TAG, "select", search],
    queryFn: async (search) => {
      const { data } = await apiClient.get<{ data: Tag[] }>(
        AUTH_API_ENDPOINTS.TAG,
        {
          params: { page: 1, limit: 10, search: search || undefined },
        },
      );
      return (data.data ?? []).map((tag) => ({
        ...tag,
        label: tag.name,
        value: tag.id,
      }));
    },
    debounceMs: DEFAULT_DEBOUNCE_MS,
  });

  const partnerSelect = useAsyncSelect<PartnerOption>({
    queryKey: (search) => [AUTH_API_ENDPOINTS.PARTNER, "select", search],
    queryFn: async (search) => {
      const { data } = await apiClient.get<{ data: Partner[] }>(
        AUTH_API_ENDPOINTS.PARTNER,
        {
          params: { page: 1, limit: 10, search: search || undefined },
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

  const serviceSelect = useAsyncSelect<ServiceOption>({
    queryKey: (search) => [AUTH_API_ENDPOINTS.SERVICES, "select", search],
    queryFn: async (search) => {
      const { data } = await apiClient.get<{ data: Service[] }>(
        AUTH_API_ENDPOINTS.SERVICES,
        {
          params: { page: 1, limit: 10, search: search || undefined },
        },
      );
      return (data.data ?? []).map((service) => ({
        ...service,
        label: service.title,
        value: service.id,
      }));
    },
    debounceMs: DEFAULT_DEBOUNCE_MS,
  });

  const createMutation = useCreateClientProjectMutation({
    onSuccess: () => {
      toast.success("Client project created successfully!");
      navigate({ to: "/dashboard/client-projects" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to create client project");
    },
  });
  const updateMutation = useUpdateClientProjectMutation({
    onSuccess: () => {
      toast.success("Client project updated successfully!");
      navigate({ to: "/dashboard/client-projects" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to update client project");
    },
  });

  const isLoading =
    mode === "create"
      ? createMutation.isPending
      : mode === "edit"
        ? updateMutation.isPending
        : false;

  const form = useDashboardForm<ClientProjectFormValues>({
    defaultValues: {
      title: initialData?.title || "",
      excerpt: initialData?.excerpt || "",
      overview: initialData?.overview || "",
      clientId: initialData?.clientId || 0,
      projectScope: initialData?.projectScope || "",
      impact: initialData?.impact || "",
      problem: initialData?.problem || "",
      process: initialData?.process || "",
      deliverable: initialData?.deliverable || "",
      serviceId: initialData?.serviceId || 0,
      tagIds: initialData?.tagIds || ([] as number[]),
    } satisfies ClientProjectFormValues,
    validators: {
      onSubmit: (mode === "create"
        ? createClientProjectFormSchema
        : updateClientProjectFormSchema) as FormValidateOrFn<ClientProjectFormValues>,
    },
    onSubmit: async ({ value }) => {
      if (mode === "view") return;

      const tagIdsToSend = value.tagIds ?? [];
      const imagesMeta =
        uploadFiles.length > 0
          ? uploadFiles.map((file, index) => ({
              position: index,
              caption: file.name,
            }))
          : undefined;

      if (mode === "create") {
        if (uploadFiles.length === 0) {
          toast.error("Please add at least one image");
          return;
        }
        await createMutation.mutateAsync({
          title: value.title,
          excerpt: value.excerpt,
          overview: value.overview,
          clientId: value.clientId,
          projectScope: value.projectScope,
          impact: value.impact || null,
          problem: value.problem || null,
          process: value.process || null,
          deliverable: value.deliverable || null,
          serviceId: value.serviceId,
          tagIds: tagIdsToSend,
          imagesMeta,
          images: uploadFiles,
        });
      } else {
        const projectId = (initialData as ClientProject | undefined)?.id;
        if (!projectId) {
          throw new Error("Project ID is required for update");
        }
        await updateMutation.mutateAsync({
          id: projectId,
          payload: {
            title: value.title,
            excerpt: value.excerpt,
            overview: value.overview,
            clientId: value.clientId,
            projectScope: value.projectScope,
            impact: value.impact || null,
            problem: value.problem || null,
            process: value.process || null,
            deliverable: value.deliverable || null,
            serviceId: value.serviceId,
            tagIds: tagIdsToSend,
            imagesMeta,
            images: uploadFiles.length > 0 ? uploadFiles : undefined,
          },
        });
      }

      resetUploads();
    },
  });

  const selectedTags = useMemo(
    () =>
      tagSelect.options.filter((tag) =>
        form.state.values.tagIds.includes(tag.id),
      ),
    [form.state.values.tagIds, tagSelect.options],
  );

  const currentPreviews =
    previews.length > 0
      ? previews
      : existingImages.length > 0
        ? existingImages
        : [];

  const isReadOnly = mode === "view";

  return (
    <div className="flex flex-col h-screen">
      <div className="p-8 flex items-center justify-between border-b border-gray-200 sticky top-0 left-0 right-0 bg-white">
        <h1 className="text-2xl font-bold">
          {mode === "create"
            ? "Create Client Project"
            : mode === "edit"
              ? "Edit Client Project"
              : "View Client Project"}
        </h1>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/dashboard/client-projects" })}
          >
            Back
          </Button>
          {mode !== "view" && (
            <Button
              type="submit"
              form="client-project-form"
              disabled={isLoading}
            >
              {isLoading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Project"
                  : "Update Project"}
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-1">
        <div className="w-full lg:w-1/2 p-8 border-r border-gray-200 overflow-y-auto">
          <form
            id="client-project-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <Field>
              <FieldLabel>Images</FieldLabel>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={(e) => {
                  if (!e.target.files) return;
                  const { errors } = handleFiles(e.target.files);
                  if (errors.length) toast.error(errors.join("\n"));
                }}
                disabled={isLoading || isReadOnly}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload project images (max 10MB each). First image is primary.
              </p>
            </Field>

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
                      placeholder="Enter project title"
                      disabled={isLoading || isReadOnly}
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

            <form.Field name="excerpt">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Excerpt</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      rows={3}
                      maxLength={255}
                      onBlur={field.handleBlur}
                      placeholder="Enter project excerpt"
                      disabled={isLoading || isReadOnly}
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

            <form.Field name="overview">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Overview</FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      rows={3}
                      maxLength={255}
                      onBlur={field.handleBlur}
                      placeholder="Short overview"
                      disabled={isLoading || isReadOnly}
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

            <form.Field name="clientId">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Client</FieldLabel>
                  <AsyncSearchableSelect
                    id="client-select"
                    value={field.state.value || undefined}
                    onChange={(value) => field.handleChange(Number(value))}
                    query={partnerSelect.search}
                    onQueryChange={partnerSelect.setSearch}
                    options={partnerSelect.options}
                    placeholder={
                      partnerSelect.isLoading
                        ? "Searching clients…"
                        : "Select client"
                    }
                    searchPlaceholder="Type to search clients..."
                    className="w-full"
                    isSearching={partnerSelect.isLoading}
                    error={
                      partnerSelect.isError ? "Failed to load clients" : null
                    }
                    disabled={isLoading || isReadOnly}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="serviceId">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Service</FieldLabel>
                  <AsyncSearchableSelect
                    id="service-select"
                    value={field.state.value || undefined}
                    onChange={(value) => field.handleChange(Number(value))}
                    query={serviceSelect.search}
                    onQueryChange={serviceSelect.setSearch}
                    options={serviceSelect.options}
                    placeholder={
                      serviceSelect.isLoading
                        ? "Searching services…"
                        : "Select service"
                    }
                    searchPlaceholder="Type to search services..."
                    className="w-full"
                    isSearching={serviceSelect.isLoading}
                    error={
                      serviceSelect.isError ? "Failed to load services" : null
                    }
                    disabled={isLoading || isReadOnly}
                  />
                </Field>
              )}
            </form.Field>

            <FieldSet>
              <FieldLabel htmlFor="tag-select">Tags</FieldLabel>
              <FieldGroup className="flex-col gap-2">
                <AsyncSearchableSelect
                  id="tag-select"
                  value={undefined}
                  onChange={(value) => {
                    const id = Number(value);
                    if (!Number.isFinite(id)) return;
                    if (form.state.values.tagIds.includes(id)) return;
                    form.setFieldValue("tagIds", [
                      ...form.state.values.tagIds,
                      id,
                    ]);
                  }}
                  query={tagSelect.search}
                  onQueryChange={tagSelect.setSearch}
                  options={tagSelect.options}
                  placeholder={
                    tagSelect.isLoading ? "Searching tags…" : "Select tags"
                  }
                  searchPlaceholder="Type to search tags..."
                  className="w-full"
                  isSearching={tagSelect.isLoading}
                  error={tagSelect.isError ? "Failed to load tags" : null}
                  disabled={isLoading || isReadOnly}
                />
              </FieldGroup>
              {selectedTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        !isReadOnly &&
                        form.setFieldValue(
                          "tagIds",
                          form.state.values.tagIds.filter(
                            (id) => id !== tag.id,
                          ),
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                      disabled={isReadOnly}
                    >
                      <span>{tag.name}</span>
                      {!isReadOnly && <span aria-hidden>×</span>}
                    </button>
                  ))}
                </div>
              )}
            </FieldSet>

            <form.Field name="projectScope">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Project Scope</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    placeholder="Describe the project scope"
                    disabled={isLoading || isReadOnly}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="impact">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Impact</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    placeholder="Project impact"
                    disabled={isLoading || isReadOnly}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="problem">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Problem</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    placeholder="Problem statement"
                    disabled={isLoading || isReadOnly}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="process">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Process</FieldLabel>
                  {isReadOnly ? (
                    <div className="rounded-md border bg-muted/50 p-3">
                      {field.state.value ? (
                        <LexicalViewer content={field.state.value} />
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No process provided.
                        </p>
                      )}
                    </div>
                  ) : (
                    <LexicalEditor
                      value={field.state.value}
                      onChange={field.handleChange}
                      placeholder="Describe the process..."
                    />
                  )}
                </Field>
              )}
            </form.Field>

            <form.Field name="deliverable">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Deliverable</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    placeholder="Final deliverable"
                    disabled={isLoading || isReadOnly}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>
          </form>
        </div>

        <div className="hidden lg:block w-1/2 p-8 overflow-y-auto bg-muted/30">
          <form.Subscribe
            selector={(state) => ({
              title: state.values.title,
              excerpt: state.values.excerpt,
              overview: state.values.overview,
              projectScope: state.values.projectScope,
              impact: state.values.impact,
              problem: state.values.problem,
              process: state.values.process,
              deliverable: state.values.deliverable,
              clientId: state.values.clientId,
              serviceId: state.values.serviceId,
              tagIds: state.values.tagIds,
            })}
          >
            {(values) => {
              const client = partnerSelect.options.find(
                (p) => p.id === values.clientId,
              );
              const service = serviceSelect.options.find(
                (s) => s.id === values.serviceId,
              );
              const tags = tagSelect.options.filter((t) =>
                values.tagIds.includes(t.id),
              );

              return (
                <ClientProjectPreview
                  title={values.title}
                  excerpt={values.excerpt}
                  overview={values.overview}
                  client={client}
                  projectScope={values.projectScope}
                  impact={values.impact || ""}
                  problem={values.problem || ""}
                  process={values.process || ""}
                  deliverable={values.deliverable || ""}
                  service={service}
                  tags={tags}
                  imagePreviews={currentPreviews}
                />
              );
            }}
          </form.Subscribe>
        </div>
      </div>
    </div>
  );
}
