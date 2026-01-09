import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function DataTablePagination<TData>({
  table,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps<TData>) {
  // Handle page index change
  const handlePageIndexChange = (pageIndex: number) => {
    if (onPageChange) {
      onPageChange(pageIndex);
    } else {
      table.setPageIndex(pageIndex);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    const pageSize = Number(value);
    if (onPageSizeChange) {
      onPageSizeChange(pageSize);
    } else {
      table.setPageSize(pageSize);
    }
  };
  return (
    <div className="flex flex-col-reverse items-center justify-end gap-4 px-2 sm:flex-row">
      <div className="flex items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        <div className="flex items-center space-x-2">
          <p className="whitespace-nowrap text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px] border-none shadow-none">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`} className="">
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            className="hidden h-8 w-8 p-0 lg:flex "
            onClick={() => handlePageIndexChange(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 "
            onClick={() => {
              if (onPageChange) {
                handlePageIndexChange(
                  table.getState().pagination.pageIndex - 1,
                );
              } else {
                table.previousPage();
              }
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 "
            onClick={() => {
              if (onPageChange) {
                handlePageIndexChange(
                  table.getState().pagination.pageIndex + 1,
                );
              } else {
                table.nextPage();
              }
            }}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="hidden h-8 w-8 p-0 lg:flex "
            onClick={() => handlePageIndexChange(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
