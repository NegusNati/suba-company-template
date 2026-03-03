import { LexicalEditor } from "@rich-text/LexicalEditor";
import type { FormValidateOrFn } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { infer as ZodInfer } from "zod";

import VacancyPreview from "./vacancy-preview";
import { AsyncSearchableSelect } from "../../components/AsyncSearchableSelect";
import {
  useCreateVacancyMutation,
  useUpdateVacancyMutation,
} from "../lib/vacancies-query";
import {
  createVacancySchema,
  vacancyEmploymentTypeSchema,
  vacancySenioritySchema,
  vacancyStatusSchema,
  vacancyWorkplaceTypeSchema,
  type CreateVacancyInput,
} from "../lib/vacancies-schema";

import { AppImage } from "@/components/common/AppImage";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchTags } from "@/features/dashboard/tags/lib/tags-api";
import { tagKeys } from "@/features/dashboard/tags/lib/tags-query";
import {
  normalizeTagListParams,
  type Tag,
} from "@/features/dashboard/tags/lib/tags-schema";
import { API_BASE_URL } from "@/lib/api-base";
import { useDashboardForm, DEFAULT_DEBOUNCE_MS } from "@/lib/forms";
import { toastApiError } from "@/lib/toast";
import { useAsyncSelect, type BaseOption } from "@/lib/useAsyncSelect";
import { useUploadField } from "@/lib/useUploadField";

type FormMode = "create" | "edit" | "view";

const vacancyFormSchema = createVacancySchema.omit({ featuredImage: true });
type VacancyFormValues = ZodInfer<typeof vacancyFormSchema>;

type TagOption = BaseOption & Tag;

const toLocalInputValue = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toIsoFromLocalInput = (local: string) => {
  const date = new Date(local);
  if (Number.isNaN(date.getTime())) return local;
  return date.toISOString();
};

const resolveAssetUrl = (url?: string | null) => {
  if (!url) return "";
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return url.startsWith("/") ? `${baseUrl}${url}` : url;
};

type VacancyFormInitialData = Partial<
  Omit<VacancyFormValues, "publishedAt" | "deadlineAt">
> & {
  id?: number;
  slug?: string;
  featuredImageUrl?: string | null;
  publishedAt?: string | null;
  deadlineAt?: string | null;
  tagIds?: number[];
};

interface VacancyFormProps {
  mode?: FormMode;
  initialData?: VacancyFormInitialData;
  initialTags?: Tag[];
}

export function VacancyForm({
  mode = "create",
  initialData,
  initialTags = [],
}: VacancyFormProps) {
  const navigate = useNavigate();
  const isReadOnly = mode === "view";

  const existingImageUrl = initialData?.featuredImageUrl
    ? resolveAssetUrl(initialData.featuredImageUrl)
    : null;

  const {
    files: uploadFiles,
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
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    initialUrls: existingImageUrl ? [existingImageUrl] : [],
  });

  const tagSelect = useAsyncSelect<TagOption>({
    queryKey: (search) => [...tagKeys.all, "select", search],
    queryFn: async (search) => {
      const params = normalizeTagListParams({
        page: 1,
        limit: 10,
        search: search || undefined,
      });
      const res = await fetchTags(params);
      return (res.data ?? []).map((tag) => ({
        ...tag,
        label: tag.name,
        value: tag.id,
      }));
    },
    debounceMs: DEFAULT_DEBOUNCE_MS,
  });

  const [tagMeta, setTagMeta] = useState<Record<number, Tag>>(() => {
    const map: Record<number, Tag> = {};
    initialTags.forEach((tag) => {
      map[tag.id] = tag;
    });
    return map;
  });

  const createMutation = useCreateVacancyMutation({
    onSuccess: () => {
      toast.success("Vacancy created successfully!");
      navigate({ to: "/dashboard/vacancies" });
    },
    onError: (error) => toastApiError(error, "Failed to create vacancy"),
  });

  const updateMutation = useUpdateVacancyMutation({
    onSuccess: () => {
      toast.success("Vacancy updated successfully!");
      navigate({ to: "/dashboard/vacancies" });
    },
    onError: (error) => toastApiError(error, "Failed to update vacancy"),
  });

  const isLoading =
    mode === "create"
      ? createMutation.isPending
      : mode === "edit"
        ? updateMutation.isPending
        : false;

  const form = useDashboardForm<VacancyFormValues>({
    defaultValues: {
      title: initialData?.title ?? "",
      excerpt: initialData?.excerpt ?? "",
      description: initialData?.description ?? "",
      department: initialData?.department ?? "",
      location: initialData?.location ?? "",
      workplaceType: initialData?.workplaceType,
      employmentType: initialData?.employmentType,
      seniority: initialData?.seniority,
      salaryMin: initialData?.salaryMin ?? undefined,
      salaryMax: initialData?.salaryMax ?? undefined,
      salaryCurrency: initialData?.salaryCurrency ?? "",
      externalApplyUrl: initialData?.externalApplyUrl ?? "",
      applyEmail: initialData?.applyEmail ?? "",
      status: initialData?.status ?? "DRAFT",
      publishedAt: toLocalInputValue(initialData?.publishedAt),
      deadlineAt: toLocalInputValue(initialData?.deadlineAt),
      tagIds: initialData?.tagIds ?? [],
    } satisfies VacancyFormValues,
    validators: {
      onSubmit:
        vacancyFormSchema as unknown as FormValidateOrFn<VacancyFormValues>,
    },
    onSubmit: async ({ value }) => {
      if (mode === "view") return;

      const publishedAt = value.publishedAt
        ? toIsoFromLocalInput(value.publishedAt)
        : undefined;
      const deadlineAt = value.deadlineAt
        ? toIsoFromLocalInput(value.deadlineAt)
        : undefined;

      const payload = {
        title: value.title,
        excerpt: value.excerpt,
        description: value.description,
        department: value.department?.trim() ? value.department : undefined,
        location: value.location?.trim() ? value.location : undefined,
        workplaceType: value.workplaceType,
        employmentType: value.employmentType,
        seniority: value.seniority,
        salaryMin: value.salaryMin,
        salaryMax: value.salaryMax,
        salaryCurrency: value.salaryCurrency?.trim()
          ? value.salaryCurrency
          : undefined,
        externalApplyUrl: value.externalApplyUrl?.trim()
          ? value.externalApplyUrl
          : undefined,
        applyEmail: value.applyEmail?.trim() ? value.applyEmail : undefined,
        status: value.status,
        publishedAt,
        deadlineAt,
        tagIds: value.tagIds,
        featuredImage: uploadFiles[0] || undefined,
      } satisfies CreateVacancyInput;

      if (mode === "create") {
        await createMutation.mutateAsync(payload);
      } else {
        const vacancyId = initialData?.id;
        if (!vacancyId) {
          throw new Error("Vacancy ID is required for update");
        }

        await updateMutation.mutateAsync({ id: vacancyId, payload });
      }

      resetUploads();
    },
  });

  const selectedTags = useMemo(() => {
    const ids = form.state.values.tagIds ?? [];
    return ids.map((id) => tagMeta[id]).filter(Boolean) as Tag[];
  }, [form.state.values.tagIds, tagMeta]);

  const handleTagSelect = (value: string | number) => {
    if (isReadOnly) return;

    const id = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(id)) return;

    const tag = tagSelect.options.find((option) => option.id === id);
    if (!tag) return;

    const existing = form.state.values.tagIds ?? [];
    if (existing.includes(tag.id)) return;

    setTagMeta((prev) => ({ ...prev, [tag.id]: tag }));
    form.setFieldValue("tagIds", [...existing, tag.id]);
  };

  const currentFeaturedPreview = previews[0] ?? null;

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-8">
        <h1 className="text-2xl font-bold">
          {mode === "create"
            ? "Create Vacancy"
            : mode === "edit"
              ? "Edit Vacancy"
              : "Vacancy Details"}
        </h1>
        <div className="flex gap-3">
          {mode !== "create" && initialData?.slug && (
            <Link
              to="/dashboard/vacancies/$slug/applications"
              params={{ slug: initialData.slug }}
              search={{ id: initialData.id }}
            >
              <Button variant="outline" disabled={!initialData.id}>
                View Applications
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/dashboard/vacancies" })}
          >
            Back
          </Button>
          {mode !== "view" && (
            <Button type="submit" form="vacancy-form" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : mode === "create"
                  ? "Create Vacancy"
                  : "Update Vacancy"}
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-1">
        <div className="w-full lg:w-1/2 overflow-y-auto border-r border-gray-200 p-8">
          <form
            id="vacancy-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
            className="space-y-8"
          >
            <FieldSet>
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
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={isLoading || isReadOnly}
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
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={isLoading || isReadOnly}
                          aria-invalid={isInvalid}
                          rows={3}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
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
                        <FieldLabel htmlFor={field.name}>
                          Description
                        </FieldLabel>
                        {isReadOnly ? (
                          <div className="rounded-md border bg-muted/50 p-3">
                            {field.state.value ? (
                              <LexicalViewer content={field.state.value} />
                            ) : (
                              <p className="text-sm text-muted-foreground italic">
                                No description provided.
                              </p>
                            )}
                          </div>
                        ) : (
                          <LexicalEditor
                            value={field.state.value}
                            onChange={field.handleChange}
                            placeholder="Write the job description..."
                          />
                        )}
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <form.Field name="department">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Department</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isLoading || isReadOnly}
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="location">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Location</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isLoading || isReadOnly}
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="workplaceType">
                  {(field) => (
                    <Field>
                      <FieldLabel>Workplace Type</FieldLabel>
                      <Select
                        value={field.state.value ?? ""}
                        onValueChange={(val) =>
                          field.handleChange(
                            val
                              ? (val as ZodInfer<
                                  typeof vacancyWorkplaceTypeSchema
                                >)
                              : undefined,
                          )
                        }
                        disabled={isLoading || isReadOnly}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {vacancyWorkplaceTypeSchema.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </form.Field>

                <form.Field name="employmentType">
                  {(field) => (
                    <Field>
                      <FieldLabel>Employment Type</FieldLabel>
                      <Select
                        value={field.state.value ?? ""}
                        onValueChange={(val) =>
                          field.handleChange(
                            val
                              ? (val as ZodInfer<
                                  typeof vacancyEmploymentTypeSchema
                                >)
                              : undefined,
                          )
                        }
                        disabled={isLoading || isReadOnly}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {vacancyEmploymentTypeSchema.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </form.Field>

                <form.Field name="seniority">
                  {(field) => (
                    <Field>
                      <FieldLabel>Seniority</FieldLabel>
                      <Select
                        value={field.state.value ?? ""}
                        onValueChange={(val) =>
                          field.handleChange(
                            val
                              ? (val as ZodInfer<typeof vacancySenioritySchema>)
                              : undefined,
                          )
                        }
                        disabled={isLoading || isReadOnly}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {vacancySenioritySchema.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <form.Field name="salaryCurrency">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Salary Currency
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isLoading || isReadOnly}
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="salaryMin">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Salary Min</FieldLabel>
                      <Input
                        id={field.name}
                        type="number"
                        min={0}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value
                              ? Number.parseInt(e.target.value, 10)
                              : undefined,
                          )
                        }
                        disabled={isLoading || isReadOnly}
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="salaryMax">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Salary Max</FieldLabel>
                      <Input
                        id={field.name}
                        type="number"
                        min={0}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value
                              ? Number.parseInt(e.target.value, 10)
                              : undefined,
                          )
                        }
                        disabled={isLoading || isReadOnly}
                      />
                    </Field>
                  )}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <form.Field name="externalApplyUrl">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        External Apply URL
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isLoading || isReadOnly}
                        placeholder="https://..."
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="applyEmail">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Apply Email</FieldLabel>
                      <Input
                        id={field.name}
                        type="email"
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isLoading || isReadOnly}
                        placeholder="jobs@company.com"
                      />
                    </Field>
                  )}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <form.Field name="status">
                  {(field) => (
                    <Field>
                      <FieldLabel>Status</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(val) =>
                          field.handleChange(
                            val as ZodInfer<typeof vacancyStatusSchema>,
                          )
                        }
                        disabled={isLoading || isReadOnly}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {vacancyStatusSchema.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </form.Field>

                <form.Field name="publishedAt">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Published At</FieldLabel>
                      <Input
                        id={field.name}
                        type="datetime-local"
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isLoading || isReadOnly}
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="deadlineAt">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Deadline</FieldLabel>
                      <Input
                        id={field.name}
                        type="datetime-local"
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isLoading || isReadOnly}
                      />
                    </Field>
                  )}
                </form.Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLabel>Featured Image</FieldLabel>
              <div className="flex flex-col gap-3">
                {!isReadOnly && (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files) return;
                      handleFiles(files);
                    }}
                    disabled={isLoading}
                  />
                )}

                {currentFeaturedPreview ? (
                  <AppImage
                    src={currentFeaturedPreview}
                    alt="Featured preview"
                    className="h-32 w-48 rounded-md object-cover"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No image selected.
                  </p>
                )}
              </div>
            </FieldSet>

            <FieldSet>
              <FieldLabel htmlFor="tag-select">Tags</FieldLabel>
              <FieldGroup className="flex-col gap-2">
                <AsyncSearchableSelect
                  id="tag-select"
                  value={undefined}
                  onChange={handleTagSelect}
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

              {(form.state.values.tagIds?.length ?? 0) > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        if (isReadOnly) return;
                        const next = (form.state.values.tagIds ?? []).filter(
                          (id) => id !== tag.id,
                        );
                        form.setFieldValue("tagIds", next);
                      }}
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
          </form>
        </div>

        <div className="hidden lg:block w-1/2 overflow-y-auto bg-muted/30 p-8">
          <form.Subscribe
            selector={(state) => ({
              title: state.values.title,
              excerpt: state.values.excerpt,
              description: state.values.description,
              department: state.values.department,
              location: state.values.location,
              workplaceType: state.values.workplaceType,
              employmentType: state.values.employmentType,
              seniority: state.values.seniority,
              salaryMin: state.values.salaryMin,
              salaryMax: state.values.salaryMax,
              salaryCurrency: state.values.salaryCurrency,
              externalApplyUrl: state.values.externalApplyUrl,
              applyEmail: state.values.applyEmail,
              status: state.values.status,
              publishedAt: state.values.publishedAt,
              deadlineAt: state.values.deadlineAt,
              tagIds: state.values.tagIds,
            })}
          >
            {(values) => (
              <VacancyPreview
                title={values.title}
                excerpt={values.excerpt ?? ""}
                description={values.description ?? ""}
                department={values.department ?? undefined}
                location={values.location ?? undefined}
                workplaceType={values.workplaceType ?? undefined}
                employmentType={values.employmentType ?? undefined}
                seniority={values.seniority ?? undefined}
                salaryMin={values.salaryMin ?? undefined}
                salaryMax={values.salaryMax ?? undefined}
                salaryCurrency={values.salaryCurrency ?? undefined}
                externalApplyUrl={values.externalApplyUrl ?? undefined}
                applyEmail={values.applyEmail ?? undefined}
                status={values.status ?? undefined}
                publishedAt={values.publishedAt ?? undefined}
                deadlineAt={values.deadlineAt ?? undefined}
                selectedTags={selectedTags}
                imagePreviews={
                  currentFeaturedPreview ? [currentFeaturedPreview] : []
                }
              />
            )}
          </form.Subscribe>
        </div>
      </div>
    </div>
  );
}
