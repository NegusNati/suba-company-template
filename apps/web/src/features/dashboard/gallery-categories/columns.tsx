import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Shield, Trash2 } from "lucide-react";

import type { GalleryCategory } from "./lib";

import { Badge } from "@/components/ui/badge";
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
  onView: (category: GalleryCategory) => void,
  onEdit: (category: GalleryCategory) => void,
  onDelete: (category: GalleryCategory) => void,
): ColumnDef<GalleryCategory>[] => [
  {
    accessorKey: "id",
    meta: { title: "ID" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "name",
    meta: { title: "Name" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[220px] truncate">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "slug",
    meta: { title: "Slug" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Slug" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[220px] truncate font-mono text-xs">
        {row.getValue("slug")}
      </div>
    ),
  },
  {
    accessorKey: "itemCount",
    meta: { title: "Entries" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Entries" />
    ),
    cell: ({ row }) => <div>{row.getValue("itemCount")}</div>,
  },
  {
    accessorKey: "isSystem",
    meta: { title: "Type" },
    header: "Type",
    cell: ({ row }) => {
      const isSystem = row.getValue("isSystem") as boolean;
      return isSystem ? (
        <Badge variant="secondary" className="gap-1">
          <Shield className="h-3 w-3" />
          System
        </Badge>
      ) : (
        <Badge variant="outline">Custom</Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    meta: { title: "Created" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-sm">
        {humanizeDate(row.getValue("createdAt")) || ""}
      </div>
    ),
  },
  {
    id: "actions",
    meta: { title: "Actions" },
    header: "Actions",
    cell: ({ row }) => {
      const category = row.original;
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
              <DropdownMenuItem onClick={() => onView(category)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              {!category.isSystem && (
                <DropdownMenuItem onClick={() => onEdit(category)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {!category.isSystem && (
                <DropdownMenuItem onClick={() => onDelete(category)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
