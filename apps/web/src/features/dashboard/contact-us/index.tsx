import { useNavigate } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Columns } from "./columns";
import {
  useContactsQuery,
  useUpdateContactMutation,
  useDeleteContactMutation,
  type Contact,
} from "./lib";
import { DeleteDialog } from "../components/deletedialog";
import { ResourceTable } from "../components/ResourceTable";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTableFilters } from "@/lib/useTableFilters";

export default function Index() {
  const navigate = useNavigate();

  // State for pagination
  const {
    page,
    limit: pageSize,
    search,
    debouncedSearch,
    setPage,
    setLimit: setPageSize,
    setSearch,
  } = useTableFilters({ route: "/dashboard/contact-us/" });

  // State for filters
  const [statusFilter, setStatusFilter] = useState<
    "all" | "handled" | "pending"
  >("all");

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  // Fetch contacts
  const {
    data: contactsData,
    isPending,
    isError,
    error,
  } = useContactsQuery({
    page,
    limit: pageSize,
    search: debouncedSearch,
    sortBy: "createdAt",
    sortOrder: "desc",
    isHandled: statusFilter === "all" ? undefined : statusFilter === "handled",
  });

  // Update mutation (for toggling handled status)
  const updateMutation = useUpdateContactMutation({
    onSuccess: () => {
      toast.success("Contact status updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update contact: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useDeleteContactMutation({
    onSuccess: () => {
      toast.success("Contact deleted successfully!");
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete contact: ${error.message}`);
    },
  });

  // Action handlers
  const handleView = (contact: Contact) => {
    navigate({
      to: `/dashboard/contact-us/$id`,
      params: { id: String(contact.id) },
    });
  };

  const handleToggleStatus = (contact: Contact) => {
    updateMutation.mutate({
      id: contact.id,
      data: { isHandled: !contact.isHandled },
    });
  };

  const handleDelete = (contact: Contact) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (contactToDelete) {
      deleteMutation.mutate(contactToDelete.id);
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  // Search handler
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  };

  const contacts = contactsData?.data || [];
  const pagination = contactsData?.meta?.pagination
    ? {
        pageCount: contactsData.meta.pagination.totalPages,
        page: contactsData.meta.pagination.page,
        limit: contactsData.meta.pagination.limit,
        setPage: handlePageChange,
        setLimit: handlePageSizeChange,
      }
    : undefined;

  // Loading skeleton
  if (isPending) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state when no contacts exist
  const hasNoContacts =
    !isPending && contacts.length === 0 && !search && statusFilter === "all";
  if (hasNoContacts) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Contact Submissions</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Mail className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No contact submissions yet
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Contact submissions from your website will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Empty state for filtered results
  const hasNoResults =
    !isPending && contacts.length === 0 && (search || statusFilter !== "all");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contact Submissions</h1>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="status-filter">Status:</Label>
          <Select
            value={statusFilter}
            onValueChange={(value: "all" | "handled" | "pending") => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger id="status-filter" className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="handled">Handled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasNoResults ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Mail className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            No contacts match your filters. Try adjusting your search or filter
            criteria.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setPage(1);
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <ResourceTable
          columns={Columns(handleView, handleToggleStatus, handleDelete)}
          data={contacts}
          pagination={pagination}
          isLoading={isPending}
          isError={isError}
          error={error}
          searchKey="fullName"
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
