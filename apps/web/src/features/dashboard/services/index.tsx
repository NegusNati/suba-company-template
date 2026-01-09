import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Columns } from "./columns";
import {
  useDeleteServiceMutation,
  useServicesQuery,
} from "./lib/services-query";
import type { Service } from "./lib/services-schema";
import { DeleteDialog } from "../components/deletedialog";
import { ResourceTable } from "../components/ResourceTable";

import { useTableFilters } from "@/lib/useTableFilters";

export default function Index() {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Service | null>(null);

  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } =
    useTableFilters({ route: "/dashboard/services/" });

  const {
    data: services,
    isPending,
    isError,
    error,
  } = useServicesQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  const handleCreate = () => {
    setSelected(null);
    navigate({ to: "/dashboard/services/create" });
  };

  const onView = (service: Service) => {
    setSelected(service);
    navigate({
      to: "/dashboard/services/$slug",
      params: { slug: service.slug },
      search: { id: service.id },
    });
  };

  const onEdit = (service: Service) => {
    setSelected(service);
    navigate({
      to: "/dashboard/services/$slug/edit",
      params: { slug: service.slug },
      search: { id: service.id },
    });
  };

  const onDelete = (service: Service) => {
    setSelected(service);
    setDeleteDialogOpen(true);
  };

  const deleteMutation = useDeleteServiceMutation({
    onSuccess: () => {
      toast.success("Service deleted successfully!");
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete service: ${mutationError.message}`);
    },
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const pagination = services?.meta?.pagination
    ? {
        pageCount: services.meta.pagination.totalPages,
        page: services.meta.pagination.page,
        limit: services.meta.pagination.limit,
        setPage,
        setLimit,
      }
    : undefined;

  return (
    <div className="p-8">
      <ResourceTable
        columns={Columns(onView, onEdit, onDelete)}
        data={services?.data || []}
        onAction={handleCreate}
        actionTitle="Create Service"
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
