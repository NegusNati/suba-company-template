import { useNavigate } from "@tanstack/react-router";
import { Images } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { Columns } from "./columns";
import {
  useGalleryItemsQuery,
  useDeleteGalleryItemMutation,
  type GalleryItem,
} from "./lib";
import { DeleteDialog } from "../components/deletedialog";
import { DataTable } from "../components/table/DataTable";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const navigate = useNavigate();

  // State for pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State for search
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);

  // Fetch gallery items
  const {
    data: galleryData,
    isPending,
    isError,
    error,
  } = useGalleryItemsQuery({
    page,
    limit: pageSize,
    search: debouncedSearch,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Delete mutation
  const deleteMutation = useDeleteGalleryItemMutation({
    onSuccess: () => {
      toast.success("Gallery item deleted successfully!");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete gallery item: ${error.message}`);
    },
  });

  // Action handlers
  const handleCreate = () => {
    navigate({ to: "/dashboard/gallery/create" });
  };

  const handleView = (item: GalleryItem) => {
    navigate({ to: `/dashboard/gallery/$id`, params: { id: String(item.id) } });
  };

  const handleEdit = (item: GalleryItem) => {
    navigate({
      to: `/dashboard/gallery/$id/edit`,
      params: { id: String(item.id) },
    });
  };

  const handleDelete = (item: GalleryItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage); // DataTable already converts to 1-indexed
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page
  };

  // Search handler
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  };

  const galleryItems = galleryData?.data || [];
  const pagination = galleryData?.meta?.pagination
    ? {
        pageCount: galleryData.meta.pagination.totalPages,
        pageIndex: galleryData.meta.pagination.page - 1,
        pageSize: galleryData.meta.pagination.limit,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
      }
    : undefined;

  // Loading skeleton
  if (isPending) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state when no gallery items exist
  const hasNoItems = !isPending && galleryItems.length === 0 && !search;
  if (hasNoItems) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Gallery</h1>
          <Button onClick={handleCreate}>
            <Images className="mr-2 h-4 w-4" />
            Add Image
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Images className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No gallery items yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Start building your gallery by adding your first image.
          </p>
          <Button onClick={handleCreate}>
            <Images className="mr-2 h-4 w-4" />
            Add First Image
          </Button>
        </div>
      </div>
    );
  }

  // Empty state for filtered results
  const hasNoResults = !isPending && galleryItems.length === 0 && search;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <Button onClick={handleCreate}>
          <Images className="mr-2 h-4 w-4" />
          Add Image
        </Button>
      </div>

      {hasNoResults ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Images className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            No gallery items match your search "{search}". Try a different
            search term.
          </p>
        </div>
      ) : (
        <DataTable
          columns={Columns(handleView, handleEdit, handleDelete)}
          data={galleryItems}
          pagination={pagination}
          isLoading={isPending}
          isError={isError}
          error={error}
          searchKey="title"
          searchValue={search}
          onSearchChange={handleSearchChange}
        />
      )}

      {/* Delete confirmation dialog */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={confirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
