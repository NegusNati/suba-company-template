import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { DataTableError } from "./DataTableError";
import { DataTableLoadingSkeleton } from "./DataTableLoadingSkeleton";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";

import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface PaginationProps {
  pageCount?: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

interface DataTableProps<TData, TValue> {
  tableTitle?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  pagination?: PaginationProps;
  searchKey?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterableColumns?: {
    id: string;
    title: string;
    options: {
      label: string;
      value: string;
    }[];
  }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolbar?: React.ComponentType<any>;
  CustomToolbar?: React.ReactNode;
  onAction?: () => void;
  actionTitle?: string;
}

export function DataTable<TData, TValue>({
  tableTitle,
  columns,
  data,
  isLoading,
  isError,
  error,
  pagination,
  searchKey,
  searchValue,
  onSearchChange,
  filterableColumns = [],
  toolbar: CustomToolbar,
  CustomToolbar: CustomToolbarJSX,
  onAction,
  actionTitle,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,

      rowSelection,
      columnFilters,
      ...(pagination && {
        pagination: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        },
      }),
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    ...(pagination && {
      manualPagination: true, // Enable manual pagination
      pageCount: pagination.pageCount ?? 0,
    }),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    ...(pagination
      ? {}
      : {
          initialState: {
            pagination: {
              pageSize: 10,
            },
          },
        }),
  });
  const ToolbarComponent = CustomToolbar || DataTableToolbar;

  const handlePaginationChange = (pageIndex: number) => {
    if (pagination) {
      pagination.onPageChange(pageIndex + 1); // Convert 0-based to 1-based for the API
    } else {
      table.setPageIndex(pageIndex);
    }
  };

  const handlePageSizeChange = (pageSize: number) => {
    if (pagination) {
      pagination.onPageSizeChange(pageSize);
    } else {
      table.setPageSize(pageSize);
    }
  };

  return (
    <div className="space-y-8">
      {CustomToolbarJSX ? (
        CustomToolbarJSX
      ) : CustomToolbar ? (
        <ToolbarComponent
          table={table}
          filterableColumns={filterableColumns}
          searchKey={searchKey}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onAction={onAction}
          actionTitle={actionTitle}
        />
      ) : (
        <DataTableToolbar
          tableTitle={tableTitle}
          table={table}
          filterableColumns={filterableColumns}
          searchKey={searchKey}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onAction={onAction}
          actionTitle={actionTitle}
        />
      )}

      {/* Separator line between toolbar and table */}
      <Separator />

      <div className="rounded-md border-0">
        <Table>
          <TableHeader className="bg-sidebar rounded-2xl h-12">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-0">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "whitespace-nowrap py-2 px-4 border-0",
                        header.index === 0 && "rounded-l-2xl",
                        header.index === headerGroup.headers.length - 1 &&
                          "rounded-r-2xl",
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          {isLoading ? (
            <DataTableLoadingSkeleton columns={columns} />
          ) : isError && error ? (
            <DataTableError error={error} columns={columns.length} />
          ) : (
            <TableBody className="rounded-2xl">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={"border-0 rounded-l-2xl hover:bg-gray-50"}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "border-0",
                          index === 0 && "rounded-l-2xl",
                          index === row.getVisibleCells().length - 1 &&
                            "rounded-r-2xl",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center border-0 rounded-2xl"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>
      {!isError && table.getRowModel().rows.length > 1 && (
        <DataTablePagination
          table={table}
          onPageChange={handlePaginationChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
