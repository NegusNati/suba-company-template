import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Columns } from "./columns";
import { useBlogsQuery, useDeleteBlogMutation } from "./lib/blogs-query";
import type { Blog } from "./lib/blogs-schema";
import { DeleteDialog } from "../components/deletedialog";
import { ResourceTable } from "../components/ResourceTable";

import { useTableFilters } from "@/lib/useTableFilters";

export default function Index() {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Blog | null>(null);

  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } =
    useTableFilters({ route: "/dashboard/blogs/" });

  const {
    data: blogs,
    isPending,
    isError,
    error,
  } = useBlogsQuery(
    {
      page,
      limit,
      search: debouncedSearch || undefined,
    },
    {},
  );

  const handleCreate = () => {
    setSelected(null);
    navigate({ to: "/dashboard/blogs/create" });
  };

  const onView = (blog: Blog) => {
    setSelected(blog);
    navigate({
      to: "/dashboard/blogs/$slug",
      params: { slug: blog.slug },
      search: { id: blog.id },
    });
  };
  const onEdit = (blog: Blog) => {
    setSelected(blog);
    navigate({
      to: "/dashboard/blogs/$slug/edit",
      params: { slug: blog.slug },
      search: { id: blog.id },
    });
  };

  const onDelete = (blog: Blog) => {
    setSelected(blog);
    setDeleteDialogOpen(true);
  };

  const deleteMutation = useDeleteBlogMutation({
    onSuccess: () => {
      toast.success("Blog deleted successfully!");
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete blog: ${mutationError.message}`);
    },
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const pagination = blogs?.meta?.pagination
    ? {
        pageCount: blogs.meta.pagination.totalPages,
        page: blogs.meta.pagination.page,
        limit: blogs.meta.pagination.limit,
        setPage,
        setLimit,
      }
    : undefined;

  return (
    <div className="p-8">
      <ResourceTable
        columns={Columns(onView, onEdit, onDelete)}
        data={blogs?.data || []}
        onAction={handleCreate}
        actionTitle="Create Blog"
        pagination={pagination}
        isLoading={isPending}
        isError={isError}
        error={error}
        searchKey="title"
        searchValue={search}
        onSearchChange={handleSearchChange}
      />

      {isDeleteDialogOpen && selected && (
        <DeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onDelete={() => {
            deleteMutation.mutate(selected.id.toString());
            setDeleteDialogOpen(false);
          }}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
