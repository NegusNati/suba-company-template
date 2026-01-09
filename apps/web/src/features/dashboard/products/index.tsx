import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Columns } from "./columns";
import {
  useDeleteProductMutation,
  useProductsQuery,
} from "./lib/products-query";
import type { Product } from "./lib/products-schema";
import { DeleteDialog } from "../components/deletedialog";
import { ResourceTable } from "../components/ResourceTable";

import { useTableFilters } from "@/lib/useTableFilters";

export default function Index() {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);

  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } =
    useTableFilters({ route: "/dashboard/products/" });

  const {
    data: products,
    isPending,
    isError,
    error,
  } = useProductsQuery(
    {
      page,
      limit,
      search: debouncedSearch || undefined,
    },
    {},
  );

  const onView = (product: Product) => {
    setSelected(product);
    navigate({
      to: "/dashboard/products/$slug",
      params: { slug: product.slug },
      search: { id: product.id },
    });
  };

  const onEdit = (product: Product) => {
    setSelected(product);
    navigate({
      to: "/dashboard/products/$slug/edit",
      params: { slug: product.slug },
      search: { id: product.id },
    });
  };

  const onDelete = (product: Product) => {
    setSelected(product);
    setDeleteDialogOpen(true);
  };

  const deleteMutation = useDeleteProductMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully!");
    },
    onError: (mutationError) => {
      toast.error(`Failed to delete product: ${mutationError.message}`);
    },
  });

  const handleCreate = () => {
    setSelected(null);
    navigate({ to: "/dashboard/products/create" });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const pagination = products?.meta?.pagination
    ? {
        pageCount: products.meta.pagination.totalPages,
        page: products.meta.pagination.page,
        limit: products.meta.pagination.limit,
        setPage,
        setLimit,
      }
    : undefined;

  return (
    <div className="p-8">
      <ResourceTable
        columns={Columns(onView, onEdit, onDelete)}
        data={products?.data || []}
        onAction={handleCreate}
        actionTitle="Create Product"
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
