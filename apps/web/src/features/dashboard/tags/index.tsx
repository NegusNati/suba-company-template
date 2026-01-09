import { useState } from "react";
import { toast } from "sonner";

import { Columns } from "./columns";
import { useDeleteTagMutation, useTagsQuery } from "./lib/tags-query";
import type { Tag } from "./lib/tags-schema";
import { TagForm } from "./TagForm";
import { CreateResourceModal } from "../components/CreateResourceModal";
import { DeleteDialog } from "../components/deletedialog";
import { ResourceTable } from "../components/ResourceTable";

import { useTableFilters } from "@/lib/useTableFilters";

export default function Index() {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Tag | null>(null);

  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } =
    useTableFilters({ route: "/dashboard/tags/" });

  const {
    data: tags,
    isPending,
    isError,
    error,
  } = useTagsQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  const onView = (tag: Tag) => {
    setSelected(tag);
    setIsViewOpen(true);
  };

  const onEdit = (tag: Tag) => {
    setSelected(tag);
    setIsEditOpen(true);
  };

  const onDelete = (tag: Tag) => {
    setSelected(tag);
    setDeleteDialogOpen(true);
  };

  const deleteMutation = useDeleteTagMutation({
    onSuccess: () => {
      toast.success("Tag deleted successfully!");
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete tag: ${mutationError.message}`);
    },
  });

  const handleCreate = () => {
    setSelected(null);
    setIsCreateOpen(true);
  };

  const handleFormSuccess = () => {
    // Refetch data after successful operation
    // The query will automatically refetch due to invalidation in mutations
  };

  const handleCloseModal = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsViewOpen(false);
    setSelected(null);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    setPage(1);
  };

  const pagination = tags?.meta?.pagination
    ? {
        pageCount: tags.meta.pagination.totalPages,
        page: tags.meta.pagination.page,
        limit: tags.meta.pagination.limit,
        setPage: handlePageChange,
        setLimit: handlePageSizeChange,
      }
    : undefined;

  return (
    <div className="p-8">
      <ResourceTable
        columns={Columns(onView, onEdit, onDelete)}
        data={tags?.data || []}
        onAction={handleCreate}
        actionTitle="Create Tag"
        pagination={pagination}
        isLoading={isPending}
        isError={isError}
        error={error}
        searchKey="name"
        searchValue={search}
        onSearchChange={handleSearchChange}
      />
      <CreateResourceModal
        isOpen={isCreateOpen}
        onClose={handleCloseModal}
        title="Add Tag"
      >
        <TagForm
          mode="create"
          tag={selected}
          onClose={handleCloseModal}
          onSuccess={handleFormSuccess}
        />
      </CreateResourceModal>
      <CreateResourceModal
        isOpen={isEditOpen}
        onClose={handleCloseModal}
        title="Edit Tag"
      >
        <TagForm
          mode="edit"
          tag={selected}
          onClose={handleCloseModal}
          onSuccess={handleFormSuccess}
        />
      </CreateResourceModal>
      <CreateResourceModal
        isOpen={isViewOpen}
        onClose={handleCloseModal}
        title="View Tag"
      >
        <TagForm
          mode="view"
          tag={selected}
          onClose={handleCloseModal}
          onSuccess={handleFormSuccess}
        />
      </CreateResourceModal>
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
