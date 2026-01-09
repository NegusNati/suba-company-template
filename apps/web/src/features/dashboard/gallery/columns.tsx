import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";

import type { GalleryItem } from "./lib/gallery-schema";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/features/dashboard/components/table/DataTableColumnHeader";
import { API_BASE_URL } from "@/lib/api-base";
import { humanizeDate } from "@/utils/dateHuman";

/**
 * Create gallery table columns with action handlers
 */
export const Columns = (
  onView: (item: GalleryItem) => void,
  onEdit: (item: GalleryItem) => void,
  onDelete: (item: GalleryItem) => void,
): ColumnDef<GalleryItem>[] => [
  {
    accessorKey: "id",
    meta: {
      title: "ID",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[80px] font-medium">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "imageUrl",
    meta: {
      title: "Image",
    },
    header: "Image",
    cell: ({ row }) => {
      const item = row.original;
      const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
      const resolveImageUrl = (imageUrl?: string | null) =>
        imageUrl
          ? imageUrl.startsWith("/")
            ? `${baseUrl}${imageUrl}`
            : imageUrl
          : "";

      return (
        <div className="flex items-center">
          <img
            src={resolveImageUrl(item.imageUrl)}
            alt={item.title || "Gallery image"}
            className="h-16 w-16 rounded object-cover border"
            loading="lazy"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    meta: {
      title: "Title",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const title = row.getValue("title") as string | null;
      return (
        <div className="max-w-[200px] truncate">
          {title || (
            <span className="text-muted-foreground italic">Untitled</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    meta: {
      title: "Description",
    },
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return (
        <div className="max-w-[250px] truncate text-sm">
          {description || (
            <span className="text-muted-foreground italic">No description</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "occurredAt",
    meta: {
      title: "Occurred At",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Occurred At" />
    ),
    cell: ({ row }) => {
      const occurredAt = row.getValue("occurredAt") as string | null;
      return (
        <div className="max-w-[120px] truncate text-sm">
          {occurredAt ? (
            humanizeDate(occurredAt) || ""
          ) : (
            <span className="text-muted-foreground italic">—</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    meta: {
      title: "Created At",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[120px] truncate text-sm">
        {humanizeDate(row.getValue("createdAt")) || ""}
      </div>
    ),
  },
  {
    id: "actions",
    meta: {
      title: "Actions",
    },
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;

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
              <DropdownMenuItem onClick={() => onView(item)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(item)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
