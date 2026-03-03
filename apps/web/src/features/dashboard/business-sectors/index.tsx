import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Columns } from "./columns";
import {
  useBusinessSectorsQuery,
  useDeleteBusinessSectorMutation,
} from "./lib/business-sectors-query";
import type { BusinessSector } from "./lib/business-sectors-schema";
import { DeleteDialog } from "../components/deletedialog";
import { ResourceTable } from "../components/ResourceTable";

import { useTableFilters } from "@/lib/useTableFilters";

export default function BusinessSectorsIndex() {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<BusinessSector | null>(null);

  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } =
    useTableFilters({ route: "/dashboard/business-sectors/" });

  const { data, isPending, isError, error } = useBusinessSectorsQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = useDeleteBusinessSectorMutation({
    onSuccess: () => {
      toast.success("Business sector deleted successfully!");
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete business sector: ${mutationError.message}`);
    },
  });

  const handleCreate = () => {
    setSelected(null);
    navigate({ to: "/dashboard/business-sectors/create" });
  };

  const onView = (sector: BusinessSector) => {
    setSelected(sector);
    navigate({
      to: "/dashboard/business-sectors/$slug",
      params: { slug: sector.slug },
      search: { id: sector.id },
    });
  };

  const onEdit = (sector: BusinessSector) => {
    setSelected(sector);
    navigate({
      to: "/dashboard/business-sectors/$slug/edit",
      params: { slug: sector.slug },
      search: { id: sector.id },
    });
  };

  const onDelete = (sector: BusinessSector) => {
    setSelected(sector);
    setDeleteDialogOpen(true);
  };

  const pagination = data?.meta?.pagination
    ? {
        pageCount: data.meta.pagination.totalPages,
        page: data.meta.pagination.page,
        limit: data.meta.pagination.limit,
        setPage,
        setLimit,
      }
    : undefined;

  return (
    <div className="p-8">
      <ResourceTable
        columns={Columns(onView, onEdit, onDelete)}
        data={data?.data || []}
        onAction={handleCreate}
        actionTitle="Create Business Sector"
        pagination={pagination}
        isLoading={isPending}
        isError={isError}
        error={error}
        searchKey="title"
        searchValue={search}
        onSearchChange={setSearch}
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
