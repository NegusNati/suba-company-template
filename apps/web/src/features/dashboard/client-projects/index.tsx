import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Columns } from "./columns";
import {
  useClientProjectsQuery,
  useDeleteClientProjectMutation,
} from "./lib/client-projects-query";
import type { ClientProject } from "./lib/client-projects-schema";
import { DeleteDialog } from "../components/deletedialog";
import { ResourceTable } from "../components/ResourceTable";

import { useTableFilters } from "@/lib/useTableFilters";

export default function Index() {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<ClientProject | null>(null);

  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } =
    useTableFilters({ route: "/dashboard/client-projects/" });

  const {
    data: clientProjects,
    isPending,
    isError,
    error,
  } = useClientProjectsQuery(
    {
      page,
      limit,
      search: debouncedSearch || undefined,
    },
    {},
  );

  const handleCreate = () => {
    setSelected(null);
    navigate({ to: "/dashboard/client-projects/create" });
  };

  const onView = (clientProject: ClientProject) => {
    setSelected(clientProject);
    navigate({
      to: "/dashboard/client-projects/$slug",
      params: { slug: clientProject.slug },
      search: { id: clientProject.id },
    });
  };

  const onEdit = (clientProject: ClientProject) => {
    setSelected(clientProject);
    navigate({
      to: "/dashboard/client-projects/$slug/edit",
      params: { slug: clientProject.slug },
      search: { id: clientProject.id },
    });
  };

  const onDelete = (clientProject: ClientProject) => {
    setSelected(clientProject);
    setDeleteDialogOpen(true);
  };

  const deleteMutation = useDeleteClientProjectMutation({
    onSuccess: () => {
      toast.success("Client project deleted successfully!");
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete client project: ${mutationError.message}`);
    },
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const pagination = clientProjects?.meta?.pagination
    ? {
        pageCount: clientProjects.meta.pagination.totalPages,
        page: clientProjects.meta.pagination.page,
        limit: clientProjects.meta.pagination.limit,
        setPage,
        setLimit,
      }
    : undefined;

  return (
    <div className="p-8">
      <ResourceTable
        columns={Columns(onView, onEdit, onDelete)}
        data={clientProjects?.data || []}
        onAction={handleCreate}
        actionTitle="Create Client Project"
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
