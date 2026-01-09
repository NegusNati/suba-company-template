import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Columns } from "./columns";
import {
  useDeleteTestimonialMutation,
  useTestimonialsQuery,
} from "./lib/testimonials-query";
import type { Testimonial } from "./lib/testimonials-schema";
import { DeleteDialog } from "../components/deletedialog";
import { ResourceTable } from "../components/ResourceTable";

import { useTableFilters } from "@/lib/useTableFilters";

export default function Index() {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Testimonial | null>(null);

  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } =
    useTableFilters({ route: "/dashboard/testimonials/" });

  const {
    data: testimonials,
    isPending,
    isError,
    error,
  } = useTestimonialsQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  const onView = (testimonial: Testimonial) => {
    navigate({
      to: "/dashboard/testimonials/$id",
      params: { id: testimonial.id.toString() },
    });
  };

  const onEdit = (testimonial: Testimonial) => {
    navigate({
      to: "/dashboard/testimonials/$id/edit",
      params: { id: testimonial.id.toString() },
    });
  };

  const onDelete = (testimonial: Testimonial) => {
    setSelected(testimonial);
    setDeleteDialogOpen(true);
  };

  const deleteMutation = useDeleteTestimonialMutation({
    onSuccess: () => {
      toast.success("Testimonial deleted successfully!");
      setDeleteDialogOpen(false);
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete testimonial: ${mutationError.message}`);
    },
  });

  const handleCreate = () => {
    navigate({ to: "/dashboard/testimonials/create" });
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

  const pagination = testimonials?.meta?.pagination
    ? {
        pageCount: testimonials.meta.pagination.totalPages,
        page: testimonials.meta.pagination.page,
        limit: testimonials.meta.pagination.limit,
        setPage: handlePageChange,
        setLimit: handlePageSizeChange,
      }
    : undefined;

  return (
    <div className="p-8">
      <ResourceTable
        columns={Columns(onView, onEdit, onDelete)}
        data={testimonials?.data || []}
        onAction={handleCreate}
        actionTitle="Create Testimonial"
        pagination={pagination}
        isLoading={isPending}
        isError={isError}
        error={error}
        searchKey="companyName"
        searchValue={search}
        onSearchChange={handleSearchChange}
      />
      {/* Delete Dialog */}
      {isDeleteDialogOpen && selected && (
        <DeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onDelete={() => {
            deleteMutation.mutate(selected.id);
          }}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
