import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Columns } from "./columns";
import {
  useDeleteVacancyMutation,
  useUpdateVacancyMutation,
  useVacanciesQuery,
} from "./lib/vacancies-query";
import type { VacancyListItem } from "./lib/vacancies-schema";
import { DeleteDialog } from "../components/deletedialog";
import { ResourceTable } from "../components/ResourceTable";

import { useTableFilters } from "@/lib/useTableFilters";

export default function VacanciesIndex() {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<VacancyListItem | null>(null);

  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } =
    useTableFilters({ route: "/dashboard/vacancies/" });

  const { data, isPending, isError, error } = useVacanciesQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = useDeleteVacancyMutation({
    onSuccess: () => toast.success("Vacancy deleted successfully!"),
    onError: (mutationError) =>
      toast.error(`Failed to delete vacancy: ${mutationError.message}`),
  });

  const updateMutation = useUpdateVacancyMutation({
    onSuccess: () => toast.success("Vacancy updated successfully!"),
    onError: (mutationError) =>
      toast.error(`Failed to update vacancy: ${mutationError.message}`),
  });

  const handleCreate = () => {
    setSelected(null);
    navigate({ to: "/dashboard/vacancies/create" });
  };

  const onView = (vacancy: VacancyListItem) => {
    navigate({
      to: "/dashboard/vacancies/$slug",
      params: { slug: vacancy.slug },
      search: { id: vacancy.id },
    });
  };

  const onEdit = (vacancy: VacancyListItem) => {
    navigate({
      to: "/dashboard/vacancies/$slug/edit",
      params: { slug: vacancy.slug },
      search: { id: vacancy.id },
    });
  };

  const onDelete = (vacancy: VacancyListItem) => {
    setSelected(vacancy);
    setDeleteDialogOpen(true);
  };

  const onChangeStatus = (
    vacancy: VacancyListItem,
    status: VacancyListItem["status"],
  ) => {
    updateMutation.mutate({
      id: vacancy.id,
      payload: { status },
    });
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
        columns={Columns(onView, onEdit, onDelete, onChangeStatus)}
        data={data?.data || []}
        onAction={handleCreate}
        actionTitle="Create Vacancy"
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
