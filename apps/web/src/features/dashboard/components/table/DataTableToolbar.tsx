import type { Table } from "@tanstack/react-table";
import { PlusCircle, X } from "lucide-react";

import { DataTableFacetedFilter } from "./DataTableFacetedFilter";
import { DataTableViewOptions } from "./DataTableViewOptions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataTableToolbarProps<TData> {
  tableTitle?: string;
  table: Table<TData>;
  filterableColumns: {
    id: string;
    title: string;
    options: {
      label: string;
      value: string;
    }[];
  }[];
  searchKey?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onAction?: () => void;
  actionTitle?: string;
}

export function DataTableToolbar<TData>({
  tableTitle,
  table,
  searchKey,
  searchValue,
  onSearchChange,
  filterableColumns = [],
  onAction,
  actionTitle,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-col gap-4 items-start justify-start md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {tableTitle && (
          <h2 className="text-xl bg-muted-foreground text-background px-4 py-1.5 font-bold">
            {tableTitle}
          </h2>
        )}
        {searchKey && (
          <Input
            placeholder="Search ..."
            value={
              onSearchChange && searchValue !== undefined
                ? searchValue
                : ((table.getColumn(searchKey)?.getFilterValue() as string) ??
                  "")
            }
            onChange={(event) => {
              if (onSearchChange) {
                onSearchChange(event.target.value);
              } else {
                table.getColumn(searchKey)?.setFilterValue(event.target.value);
              }
            }}
            className="h-10 w-full md:max-w-sm rounded-3xl bg-sidebar border-none"
          />
        )}
        <div className="flex flex-wrap gap-2">
          {filterableColumns.map((column) => {
            const columnFilter = table.getColumn(column.id);
            if (!columnFilter) return null;

            return (
              <DataTableFacetedFilter
                key={column.id}
                column={columnFilter}
                title={column.title}
                options={column.options}
              />
            );
          })}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-10 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <DataTableViewOptions table={table} />
        {onAction && (
          <Button
            className="px-6 h-9 gap-2 text-primary"
            onClick={onAction}
            title="Add New"
            variant="ghost"
          >
            <PlusCircle size={16} /> {actionTitle ?? "Add New"}
          </Button>
        )}
      </div>
    </div>
  );
}
