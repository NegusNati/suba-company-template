import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Columns } from "./columns";
import {
  useDeletePartnerMutation,
  usePartnersQuery,
} from "./lib/partners-query";
import type { Partner } from "./lib/partners-schema";
import { DeleteDialog } from "../components/deletedialog";
import { ResourceTable } from "../components/ResourceTable";

import { useTableFilters } from "@/lib/useTableFilters";

export default function Index() {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Partner | null>(null);

  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } =
    useTableFilters({ route: "/dashboard/partners/" });

  const {
    data: partners,
    isPending,
    isError,
    error,
  } = usePartnersQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  const onView = (partner: Partner) => {
    navigate({
      to: "/dashboard/partners/$id",
      params: { id: partner.id.toString() },
    });
  };

  const onEdit = (partner: Partner) => {
    navigate({
      to: "/dashboard/partners/$id/edit",
      params: { id: partner.id.toString() },
    });
  };

  const onDelete = (partner: Partner) => {
    setSelected(partner);
    setDeleteDialogOpen(true);
  };

  const deleteMutation = useDeletePartnerMutation({
    onSuccess: () => {
      toast.success("Partner deleted successfully!");
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete partner: ${mutationError.message}`);
    },
  });

  const handleCreate = () => {
    navigate({ to: "/dashboard/partners/create" });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const pagination = partners?.meta?.pagination
    ? {
        pageCount: partners.meta.pagination.totalPages,
        page: partners.meta.pagination.page,
        limit: partners.meta.pagination.limit,
        setPage,
        setLimit,
      }
    : undefined;

  return (
    <div className="p-8">
      <ResourceTable
        columns={Columns(onView, onEdit, onDelete)}
        data={partners?.data || []}
        onAction={handleCreate}
        actionTitle="Create Partner"
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
            deleteMutation.mutate(selected.id);
            setDeleteDialogOpen(false);
          }}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
