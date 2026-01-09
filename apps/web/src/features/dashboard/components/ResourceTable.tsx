import { type ColumnDef } from "@tanstack/react-table";
import type React from "react";

import { DataTable } from "./table/DataTable";

type PaginationConfig = {
  page: number;
  limit: number;
  pageCount?: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
};

type ResourceTableProps<TData, TValue> = {
  title?: string;
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  pagination?: PaginationConfig;
  searchKey: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAction?: () => void;
  actionTitle?: string;
  toolbar?: React.ComponentType<unknown>;
  CustomToolbar?: React.ReactNode;
};

/**
 * Thin wrapper around DataTable that standardizes pagination + search wiring.
 */
export function ResourceTable<TData, TValue>({
  title,
  columns,
  data,
  isLoading,
  isError,
  error,
  pagination,
  searchKey,
  searchValue,
  onSearchChange,
  onAction,
  actionTitle,
  toolbar,
  CustomToolbar,
}: ResourceTableProps<TData, TValue>) {
  const pageIndex =
    pagination !== undefined ? Math.max(0, (pagination.page ?? 1) - 1) : 0;

  return (
    <DataTable
      tableTitle={title}
      columns={columns}
      data={data ?? []}
      isLoading={isLoading}
      isError={isError}
      error={error}
      pagination={
        pagination
          ? {
              pageIndex,
              pageSize: pagination.limit,
              pageCount: pagination.pageCount,
              onPageChange: pagination.setPage,
              onPageSizeChange: pagination.setLimit,
            }
          : undefined
      }
      searchKey={searchKey}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      onAction={onAction}
      actionTitle={actionTitle}
      toolbar={toolbar}
      CustomToolbar={CustomToolbar}
    />
  );
}
