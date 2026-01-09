import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";

import type { Tag } from "./lib/tags-schema";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/features/dashboard/components/table/DataTableColumnHeader";
import { humanizeDate } from "@/utils/dateHuman";

export const Columns = (
  onView: (tag: Tag) => void,
  onEdit: (tag: Tag) => void,
  onDelete: (tag: Tag) => void,
): ColumnDef<Tag>[] => [
  {
    accessorKey: "id",
    meta: {
      title: "Id",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "name",
    meta: {
      title: "Name",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "slug",
    meta: {
      title: "Slug",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Slug" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.getValue("slug")}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    meta: {
      title: "Slug",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Slug" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">
        {humanizeDate(row.getValue("createdAt")) || ""}
      </div>
    ),
  },
  {
    id: "actions",
    meta: {
      title: "Action",
    },
    header: "Action",
    cell: ({ row }) => {
      const tag = row.original;

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(tag)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(tag)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit{" "}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(tag)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete{" "}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
