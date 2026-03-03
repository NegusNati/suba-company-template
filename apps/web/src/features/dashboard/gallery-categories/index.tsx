import { useState } from "react";
import { toast } from "sonner";

import { CategoryForm } from "./CategoryForm";
import { Columns } from "./columns";
import {
  useDeleteGalleryCategoryMutation,
  useGalleryCategoriesQuery,
  type GalleryCategory,
} from "./lib";
import { CreateResourceModal } from "../components/CreateResourceModal";
import { DeleteDialog } from "../components/deletedialog";
import { ResourceTable } from "../components/ResourceTable";

import { useTableFilters } from "@/lib/useTableFilters";

export default function GalleryCategoriesIndex() {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<GalleryCategory | null>(null);

  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } =
    useTableFilters({ route: "/dashboard/gallery/categories" });

  const {
    data: categories,
    isPending,
    isError,
    error,
  } = useGalleryCategoriesQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = useDeleteGalleryCategoryMutation({
    onSuccess: () => {
      toast.success("Gallery category deleted successfully!");
    },
    onError: (mutationError) => {
      toast.error(
        `Failed to delete gallery category: ${mutationError.message}`,
      );
    },
  });

  const onView = (category: GalleryCategory) => {
    setSelected(category);
    setIsViewOpen(true);
  };

  const onEdit = (category: GalleryCategory) => {
    setSelected(category);
    setIsEditOpen(true);
  };

  const onDelete = (category: GalleryCategory) => {
    setSelected(category);
    setDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    setSelected(null);
    setIsCreateOpen(true);
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

  const pagination = categories?.meta?.pagination
    ? {
        pageCount: categories.meta.pagination.totalPages,
        page: categories.meta.pagination.page,
        limit: categories.meta.pagination.limit,
        setPage,
        setLimit,
      }
    : undefined;

  return (
    <div className="p-8">
      <ResourceTable
        title="Gallery Categories"
        columns={Columns(onView, onEdit, onDelete)}
        data={categories?.data || []}
        onAction={handleCreate}
        actionTitle="Create Category"
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
        title="Add Gallery Category"
      >
        <CategoryForm mode="create" onClose={handleCloseModal} />
      </CreateResourceModal>

      <CreateResourceModal
        isOpen={isEditOpen}
        onClose={handleCloseModal}
        title="Edit Gallery Category"
      >
        <CategoryForm
          mode="edit"
          category={selected}
          onClose={handleCloseModal}
        />
      </CreateResourceModal>

      <CreateResourceModal
        isOpen={isViewOpen}
        onClose={handleCloseModal}
        title="View Gallery Category"
      >
        <CategoryForm
          mode="view"
          category={selected}
          onClose={handleCloseModal}
        />
      </CreateResourceModal>

      {isDeleteDialogOpen && selected && !selected.isSystem && (
        <DeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onDelete={() => {
            deleteMutation.mutate(selected.id);
            setDeleteDialogOpen(false);
          }}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
