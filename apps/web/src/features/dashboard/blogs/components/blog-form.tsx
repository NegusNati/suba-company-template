import { LexicalEditor } from "@rich-text/LexicalEditor";
import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import { type FormValidateOrFn } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { infer as ZodInfer } from "zod";

import BlogPreview from "./blog-preview";
import { AsyncSearchableSelect } from "../../components/AsyncSearchableSelect";
import {
  useCreateBlogMutation,
  useUpdateBlogMutation,
} from "../lib/blogs-query";
import {
  createBlogSchema,
  updateBlogSchema,
  type UpdateBlog,
} from "../lib/blogs-schema";

import { LexicalViewer } from "@/components/common/rich-text/LexicalViewer";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchTags } from "@/features/dashboard/tags/lib/tags-api";
import { tagKeys } from "@/features/dashboard/tags/lib/tags-query";
import {
  normalizeTagListParams,
  type Tag,
} from "@/features/dashboard/tags/lib/tags-schema";
import { useUserByIdQuery } from "@/features/dashboard/user-management/lib/users-query";
import {
  normalizeUsersListParams,
  type User,
} from "@/features/dashboard/user-management/lib/users-schema";
import { API_BASE_URL } from "@/lib/api-base";
import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";
import { authClient } from "@/lib/auth-client";
import apiClient from "@/lib/axios";
import { DEFAULT_DEBOUNCE_MS, useDashboardForm } from "@/lib/forms";
import { toastApiError } from "@/lib/toast";
import { useAsyncSelect, type BaseOption } from "@/lib/useAsyncSelect";
import { useUploadField } from "@/lib/useUploadField";

type FormMode = "create" | "edit" | "view";

interface BlogFormProps {
  mode?: FormMode;
  initialData?: UpdateBlog & { id?: number };
  initialTags?: Tag[];
}

const createBlogFormSchema = createBlogSchema.omit({
  featuredImage: true,
});
const updateBlogFormSchema = updateBlogSchema.omit({
  featuredImage: true,
});
type BlogFormValues = ZodInfer<typeof createBlogFormSchema>;

type TagOption = BaseOption & Tag;
type UserOption = BaseOption & Pick<User, "id" | "name" | "email">;

const toLocalInputValue = (iso?: string) => {
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

const resolveImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) return "";
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return imageUrl.startsWith("/") ? `${baseUrl}${imageUrl}` : imageUrl;
};

export function BlogForm({
  mode = "create",
  initialData,
  initialTags = [],
}: BlogFormProps) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const defaultAuthorId = initialData?.authorId ?? session?.user?.id ?? "";
  const waitingForAuthor =
    mode === "create" &&
    !initialData?.authorId &&
    !defaultAuthorId &&
    sessionPending;

  if (waitingForAuthor) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        Loading author information…
      </div>
    );
  }

  return (
    <BlogFormContent
      mode={mode}
      initialData={initialData}
      defaultAuthorId={defaultAuthorId}
      initialTags={initialTags}
    />
  );
}

type BlogFormContentProps = BlogFormProps & {
  defaultAuthorId: string;
};

function BlogFormContent({
  mode = "create",
  initialData,
  defaultAuthorId,
  initialTags = [],
}: BlogFormContentProps) {
  const navigate = useNavigate();
  const existingImageUrl = initialData?.featuredImageUrl
    ? resolveImageUrl(initialData.featuredImageUrl)
    : null;

  const {
    files: uploadFiles,
    previews,
    handleFiles,
    reset: resetUploads,
  } = useUploadField({
    accept: ["image/jpeg", "image/png", "image/gif", "image/webp"],
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

  const authorSelect = useAsyncSelect<UserOption>({
    queryKey: (search) => [AUTH_API_ENDPOINTS.USERS, "select", search],
    queryFn: async (search) => {
      const params = normalizeUsersListParams({
        page: 1,
        limit: 10,
        search: search || undefined,
      });
      const { data } = await apiClient.get<ApiSuccessResponse<User[]>>(
        AUTH_API_ENDPOINTS.USERS,
        { params },
      );
      return (data.data ?? []).map((user) => ({
        ...user,
        label: user.name || user.email || user.id,
        value: user.id,
      }));
    },
    debounceMs: DEFAULT_DEBOUNCE_MS,
  });

  const createMutation = useCreateBlogMutation({
    onSuccess: () => {
      toast.success("Blog created successfully!");
      navigate({ to: "/dashboard/blogs" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to create blog");
    },
  });

  const updateMutation = useUpdateBlogMutation({
    onSuccess: () => {
      toast.success("Blog updated successfully!");
      navigate({ to: "/dashboard/blogs" });
    },
    onError: (error) => {
      toastApiError(error, "Failed to update blog");
    },
  });

  const isLoading =
    mode === "create"
      ? createMutation.isPending
      : mode === "edit"
        ? updateMutation.isPending
        : false;

  const form = useDashboardForm<BlogFormValues>({
    defaultValues: {
      title: initialData?.title ?? "",
      excerpt: initialData?.excerpt ?? "",
      content: initialData?.content ?? "",
      publishDate: toLocalInputValue(initialData?.publishDate),
      readTimeMinutes: initialData?.readTimeMinutes ?? 5,
      tagIds: (initialData?.tagIds as number[] | undefined) ?? [],
      authorId: defaultAuthorId,
    } satisfies BlogFormValues,
    validators: {
      onSubmit: (mode === "create"
        ? createBlogFormSchema
        : updateBlogFormSchema) as FormValidateOrFn<BlogFormValues>,
    },
    onSubmit: async ({ value }) => {
      if (mode === "view") return;

      const authorId = value.authorId;
      if (!authorId) {
        toast.error("Please select an author");
        return;
      }

      const publishDateIso = value.publishDate
        ? toIsoFromLocalInput(value.publishDate)
        : "";

      const tagIdsToSend = value.tagIds ?? [];

      if (mode === "create") {
        if (!uploadFiles[0]) {
          toast.error("Please add a featured image");
          return;
        }

        await createMutation.mutateAsync({
          title: value.title,
          excerpt: value.excerpt,
          content: value.content,
          authorId,
          publishDate: publishDateIso,
          readTimeMinutes: value.readTimeMinutes,
          tagIds: tagIdsToSend,
          featuredImage: uploadFiles[0],
        });
      } else {
        const blogId = initialData?.id;
        if (!blogId) {
          throw new Error("Blog ID is required for update");
        }

        await updateMutation.mutateAsync({
          id: blogId,
          payload: {
            title: value.title,
            excerpt: value.excerpt,
            content: value.content,
            authorId,
            publishDate: publishDateIso,
            readTimeMinutes: value.readTimeMinutes,
            tagIds: tagIdsToSend.length > 0 ? tagIdsToSend : undefined,
            featuredImage: uploadFiles[0] || undefined,
          },
        });
      }

      resetUploads();
    },
  });

  const selectedAuthorId = form.state.values.authorId ?? "";
  const { data: selectedAuthorData } = useUserByIdQuery(selectedAuthorId, {
    enabled: Boolean(selectedAuthorId),
  });

  const selectedAuthorOption = useMemo(() => {
    if (!selectedAuthorId) return null;
    const existing = authorSelect.options.find(
      (option) => option.value === selectedAuthorId,
    );
    if (existing) return existing;
    const fallbackUser = selectedAuthorData?.data;
    if (fallbackUser) {
      return {
        ...fallbackUser,
        label: fallbackUser.name || fallbackUser.email || fallbackUser.id,
        value: fallbackUser.id,
      } satisfies UserOption;
    }
    return {
      id: selectedAuthorId,
      name: selectedAuthorId,
      email: selectedAuthorId,
      label: selectedAuthorId,
      value: selectedAuthorId,
    } satisfies UserOption;
  }, [authorSelect.options, selectedAuthorData?.data, selectedAuthorId]);

  const authorOptions = useMemo(() => {
    if (!selectedAuthorOption) {
      return authorSelect.options;
    }
    const exists = authorSelect.options.some(
      (option) => option.value === selectedAuthorOption.value,
    );
    return exists
      ? authorSelect.options
      : [...authorSelect.options, selectedAuthorOption];
  }, [authorSelect.options, selectedAuthorOption]);

  const [tagMeta, setTagMeta] = useState<Record<number, Tag>>(() => {
    const map: Record<number, Tag> = {};
    initialTags.forEach((tag) => {
      map[tag.id] = tag;
    });
    return map;
  });

  const selectedTags = useMemo(() => {
    const optionMap = new Map<number, Tag>(
      tagSelect.options.map((tag) => [tag.id, tag]),
    );
    return form.state.values.tagIds
      .map((id) => optionMap.get(id) ?? tagMeta[id])
      .filter(Boolean) as Tag[];
  }, [form.state.values.tagIds, tagMeta, tagSelect.options]);

  const handleTagSelect = (value: string | number) => {
    const id = Number(value);
    if (!Number.isFinite(id)) return;
    if (form.state.values.tagIds.includes(id)) return;
    const option = tagSelect.options.find((tag) => tag.id === id);
    if (option) {
      setTagMeta((prev) => (prev[id] ? prev : { ...prev, [id]: option }));
    } else {
      setTagMeta((prev) =>
        prev[id]
          ? prev
          : {
              ...prev,
              [id]: {
                id,
                name: `Tag ${id}`,
                slug: `tag-${id}`,
                createdAt: new Date().toISOString(),
              },
            },
      );
    }
    form.setFieldValue("tagIds", [...form.state.values.tagIds, id]);
  };

  const currentFeaturedPreview = previews[0] ?? existingImageUrl ?? null;

  const isReadOnly = mode === "view";

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-8">
        <h1 className="text-2xl font-bold">
          {mode === "create"
            ? "Create Blog"
            : mode === "edit"
              ? "Edit Blog"
              : "View Blog"}
        </h1>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/dashboard/blogs" })}
          >
            Back
          </Button>
          {mode !== "view" && (
            <Button type="submit" form="blog-form" disabled={isLoading}>
              {isLoading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Blog"
                  : "Update Blog"}
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-1">
        <div className="w-full lg:w-1/2 overflow-y-auto border-r border-gray-200 p-8">
          <form
            id="blog-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <Field>
              <FieldLabel>Featured Image</FieldLabel>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  if (!e.target.files) return;
                  const { errors } = handleFiles(e.target.files);
                  if (errors.length) toast.error(errors.join("\n"));
                  // handled via useUploadField; tanstack form doesn't track file state
                }}
                disabled={isLoading || isReadOnly}
              />
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
                      placeholder="Enter blog title"
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

            <form.Field name="authorId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Author</FieldLabel>
                    <AsyncSearchableSelect
                      id={field.name}
                      value={field.state.value ?? ""}
                      onChange={(value) => field.handleChange(String(value))}
                      query={authorSelect.search}
                      onQueryChange={authorSelect.setSearch}
                      options={authorOptions}
                      placeholder={
                        authorSelect.isLoading
                          ? "Searching authors…"
                          : "Select author"
                      }
                      searchPlaceholder="Type to search authors..."
                      className="w-full"
                      isSearching={authorSelect.isLoading}
                      error={
                        authorSelect.isError ? "Failed to load authors" : null
                      }
                      disabled={isLoading || isReadOnly}
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
                      placeholder="Short summary for listing"
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

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="publishDate">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Publish Date</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="datetime-local"
                        value={field.state.value}
                        onBlur={field.handleBlur}
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

              <form.Field name="readTimeMinutes">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Read Time (minutes)
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={1}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        disabled={isLoading || isReadOnly}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value
                              ? Number.parseInt(e.target.value, 10)
                              : (undefined as unknown as number),
                          )
                        }
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>

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

            <form.Field name="content">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Content</FieldLabel>
                    {isReadOnly ? (
                      <div className="rounded-md border bg-muted/50 p-3">
                        {field.state.value ? (
                          <LexicalViewer content={field.state.value} />
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No content provided.
                          </p>
                        )}
                      </div>
                    ) : (
                      <LexicalEditor
                        value={field.state.value}
                        onChange={field.handleChange}
                        placeholder="Write the full blog content..."
                      />
                    )}
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </form>
        </div>

        <div className="hidden lg:block w-1/2 overflow-y-auto p-8 bg-muted/30">
          <form.Subscribe
            selector={(state) => ({
              title: state.values.title,
              excerpt: state.values.excerpt,
              content: state.values.content,
              publishDate: state.values.publishDate,
              readTimeMinutes: state.values.readTimeMinutes,
              tagIds: state.values.tagIds,
            })}
          >
            {(values) => (
              <BlogPreview
                title={values.title}
                excerpt={values.excerpt}
                content={values.content}
                publishDate={values.publishDate}
                readTimeMinutes={values.readTimeMinutes}
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
