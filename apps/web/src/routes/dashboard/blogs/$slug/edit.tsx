import { createFileRoute } from "@tanstack/react-router";

import {
  fetchBlogById,
  fetchBlogBySlug,
  type BlogResponse,
} from "@/features/dashboard/blogs/lib/blogs-api";
import { blogKeys } from "@/features/dashboard/blogs/lib/blogs-query";
import { prefetchResource } from "@/lib/prefetch";
import { queryClient } from "@/main";

export const Route = createFileRoute("/dashboard/blogs/$slug/edit")({
  validateSearch: (search: Record<string, unknown> = {}) => {
    const rawId = search.id;
    const id =
      typeof rawId === "number" ? rawId : rawId ? Number(rawId) : undefined;
    return { id };
  },
  loader: async ({
    search = {},
    params,
  }: {
    search?: { id?: number };
    params: { slug: string };
  }) => {
    const slug = params.slug;
    const idFromSearch =
      typeof search.id === "number"
        ? search.id
        : search.id
          ? Number(search.id)
          : undefined;

    let blogResponse: BlogResponse | undefined;
    let blogId = idFromSearch;

    if (idFromSearch) {
      // Fast path when we already have the id from the list navigation.
      blogResponse = await prefetchResource(
        queryClient,
        blogKeys.detail(idFromSearch),
        () => fetchBlogById(idFromSearch, { includeTags: true }),
      );
    } else {
      // Derive the id from the slug to support direct deep links.
      const slugResponse = await prefetchResource(
        queryClient,
        blogKeys.slug(slug),
        () => fetchBlogBySlug(slug),
      );
      blogId = slugResponse?.data?.id;

      const resolvedBlogId = blogId;
      if (resolvedBlogId) {
        blogResponse = await prefetchResource(
          queryClient,
          blogKeys.detail(resolvedBlogId),
          () => fetchBlogById(resolvedBlogId, { includeTags: true }),
        );
      }
    }

    if (!blogId || Number.isNaN(blogId)) {
      throw new Error(
        "Missing blog identifier. Please navigate from the blogs list.",
      );
    }

    // Seed the id-based cache so the detail form can reuse it without refetching.
    if (blogResponse) {
      queryClient.setQueryData(blogKeys.detail(blogId), blogResponse);
    }

    return { id: blogId };
  },
});
