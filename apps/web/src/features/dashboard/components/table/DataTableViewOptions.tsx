import type { Table, Column } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

type ColumnMeta = { title?: string };

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const getLabel = (col: Column<TData, unknown>) => {
    // 1) Prefer explicit, localized label you put in meta
    const meta = (col.columnDef?.meta ?? {}) as ColumnMeta;
    if (meta.title) return meta.title;

    // 2) If header is a plain string, use it
    if (typeof col.columnDef?.header === "string") {
      return col.columnDef.header;
    }

    // 3) Fallback to id
    return col.id;
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="ml-auto h-9 flex">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide(),
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {getLabel(column)}{" "}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
