import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { Columns } from "./columns";
import {
  useDeleteOrgMemberMutation,
  useOrgMembersQuery,
} from "./lib/org-query";
import type { OrgMember } from "./lib/org-schema";
import { OrgMemberForm } from "./OrgMemberForm";
import { CreateResourceModal } from "../components/CreateResourceModal";
import { DeleteDialog } from "../components/deletedialog";
import { DataTable } from "../components/table/DataTable";

export default function Index() {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<OrgMember | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  // Debounce search input with 500ms delay
  const [debouncedSearch] = useDebounce(search, 500);

  const {
    data: orgMembers,
    isPending,
    isError,
    error,
  } = useOrgMembersQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  // Memoize handlers with useCallback to prevent recreation on every render
  const onView = useCallback((member: OrgMember) => {
    setSelected(member);
    setIsViewOpen(true);
  }, []);

  const onEdit = useCallback((member: OrgMember) => {
    setSelected(member);
    setIsEditOpen(true);
  }, []);

  const onDelete = useCallback((member: OrgMember) => {
    setSelected(member);
    setDeleteDialogOpen(true);
  }, []);

  const deleteMutation = useDeleteOrgMemberMutation({
    onSuccess: () => {
      toast.success("Organization member deleted successfully!");
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete member: ${mutationError.message}`);
    },
  });

  const handleCreate = useCallback(() => {
    setSelected(null);
    setIsCreateOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    // Refetch data after successful operation
    // The query will automatically refetch due to invalidation in mutations
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsViewOpen(false);
    setSelected(null);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setLimit(newPageSize);
    setPage(1);
  }, []);

  // Memoize columns to prevent recreation on every render
  const columns = useMemo(
    () => Columns(onView, onEdit, onDelete),
    [onView, onEdit, onDelete],
  );

  // Memoize data array to prevent new array reference on every render
  const tableData = useMemo(() => orgMembers?.data ?? [], [orgMembers?.data]);

  const pagination = useMemo(
    () =>
      orgMembers?.meta?.pagination
        ? {
            pageCount: orgMembers.meta.pagination.totalPages,
            pageIndex: orgMembers.meta.pagination.page - 1,
            pageSize: orgMembers.meta.pagination.limit,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }
        : undefined,
    [orgMembers?.meta?.pagination, handlePageChange, handlePageSizeChange],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (selected) {
      deleteMutation.mutate(selected.id);
      setDeleteDialogOpen(false);
    }
  }, [selected, deleteMutation]);

  const handleDeleteClose = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  return (
    <div className="p-8">
      <DataTable
        columns={columns}
        data={tableData}
        onAction={handleCreate}
        actionTitle="Create Member"
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
        title="Add Organization Member"
      >
        <OrgMemberForm
          mode="create"
          member={selected}
          onClose={handleCloseModal}
          onSuccess={handleFormSuccess}
        />
      </CreateResourceModal>
      <CreateResourceModal
        isOpen={isEditOpen}
        onClose={handleCloseModal}
        title="Edit Organization Member"
      >
        <OrgMemberForm
          mode="edit"
          member={selected}
          onClose={handleCloseModal}
          onSuccess={handleFormSuccess}
        />
      </CreateResourceModal>
      <CreateResourceModal
        isOpen={isViewOpen}
        onClose={handleCloseModal}
        title="View Organization Member"
      >
        <OrgMemberForm
          mode="view"
          member={selected}
          onClose={handleCloseModal}
          onSuccess={handleFormSuccess}
        />
      </CreateResourceModal>
      {isDeleteDialogOpen && selected && (
        <DeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteClose}
          onDelete={handleDeleteConfirm}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
