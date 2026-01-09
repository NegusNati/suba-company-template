import { BlogForm } from "../components/blog-form";
import { useBlogByIdQuery } from "../lib/blogs-query";
import type { UpdateBlog } from "../lib/blogs-schema";

interface BlogDetailProps {
  blogId: number;
  mode: "edit" | "view";
}

export default function BlogDetail({ blogId, mode }: BlogDetailProps) {
  const { data, isPending, isError, error } = useBlogByIdQuery(blogId);

  if (isPending) {
    return <div className="p-8">Loading blog...</div>;
  }

  if (isError || !data?.data) {
    return (
      <div className="p-8 text-destructive">
        Failed to load blog{error ? `: ${error.message}` : ""}
      </div>
    );
  }

  const blog = data.data;

  const initialData: UpdateBlog = {
    id: blog.id,
    title: blog.title,
    excerpt: blog.excerpt ?? "",
    content: blog.content,
    publishDate: blog.publishDate ?? "",
    readTimeMinutes: blog.readTimeMinutes ?? undefined,
    tagIds: blog.tags.map((tag) => tag.id),
    featuredImageUrl: blog.featuredImageUrl ?? null,
  };

  return (
    <BlogForm mode={mode} initialData={initialData} initialTags={blog.tags} />
  );
}
