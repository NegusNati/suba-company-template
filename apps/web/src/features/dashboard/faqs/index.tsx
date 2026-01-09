import { useState } from "react";
import { toast } from "sonner";

import { Columns } from "./columns";
import { FaqForm } from "./FaqForm";
import { useDeleteFaqMutation, useFaqsQuery } from "./lib/faqs-query";
import type { Faq } from "./lib/faqs-schema";
import { CreateResourceModal } from "../components/CreateResourceModal";
import { DeleteDialog } from "../components/deletedialog";
import { ResourceTable } from "../components/ResourceTable";

import { useTableFilters } from "@/lib/useTableFilters";

export default function Index() {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Faq | null>(null);

  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } =
    useTableFilters({ route: "/dashboard/faqs/" });

  const {
    data: faqs,
    isPending,
    isError,
    error,
  } = useFaqsQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  const onView = (faq: Faq) => {
    setSelected(faq);
    setIsViewOpen(true);
  };

  const onEdit = (faq: Faq) => {
    setSelected(faq);
    setIsEditOpen(true);
  };

  const onDelete = (faq: Faq) => {
    setSelected(faq);
    setDeleteDialogOpen(true);
  };

  const deleteMutation = useDeleteFaqMutation({
    onSuccess: () => {
      toast.success("FAQ deleted successfully!");
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete FAQ: ${mutationError.message}`);
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

  const pagination = faqs?.meta?.pagination
    ? {
        pageCount: faqs.meta.pagination.totalPages,
        page: faqs.meta.pagination.page,
        limit: faqs.meta.pagination.limit,
        setPage: handlePageChange,
        setLimit: handlePageSizeChange,
      }
    : undefined;

  return (
    <div className="p-8">
      <ResourceTable
        columns={Columns(onView, onEdit, onDelete)}
        data={faqs?.data || []}
        onAction={handleCreate}
        actionTitle="Create FAQ"
        pagination={pagination}
        isLoading={isPending}
        isError={isError}
        error={error}
        searchKey="question"
        searchValue={search}
        onSearchChange={handleSearchChange}
      />
      <CreateResourceModal
        isOpen={isCreateOpen}
        onClose={handleCloseModal}
        title="Add FAQ"
      >
        <FaqForm
          mode="create"
          faq={selected}
          onClose={handleCloseModal}
          onSuccess={handleFormSuccess}
        />
      </CreateResourceModal>
      <CreateResourceModal
        isOpen={isEditOpen}
        onClose={handleCloseModal}
        title="Edit FAQ"
      >
        <FaqForm
          mode="edit"
          faq={selected}
          onClose={handleCloseModal}
          onSuccess={handleFormSuccess}
        />
      </CreateResourceModal>
      <CreateResourceModal
        isOpen={isViewOpen}
        onClose={handleCloseModal}
        title="View FAQ"
      >
        <FaqForm
          mode="view"
          faq={selected}
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
