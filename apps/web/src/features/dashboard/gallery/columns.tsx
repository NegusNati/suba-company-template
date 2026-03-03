import type { ColumnDef } from "@tanstack/react-table";
import { Eye, ImageIcon, Pencil, Tag, Trash2 } from "lucide-react";

import type { GalleryItem } from "./lib/gallery-schema";

import { AppImage } from "@/components/common/AppImage";
import { Badge } from "@/components/ui/badge";
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

const resolveImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl) return "";
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return imageUrl.startsWith("/") ? `${baseUrl}${imageUrl}` : imageUrl;
};

export const Columns = (
  onView: (item: GalleryItem) => void,
  onEdit: (item: GalleryItem) => void,
  onDelete: (item: GalleryItem) => void,
): ColumnDef<GalleryItem>[] => [
  {
    accessorKey: "id",
    meta: { title: "ID" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[80px] font-medium">{row.getValue("id")}</div>
    ),
  },
  {
    id: "coverImage",
    meta: { title: "Cover" },
    header: "Cover",
    cell: ({ row }) => {
      const item = row.original;
      const coverImage = resolveImageUrl(
        item.coverImageUrl ?? item.imageUrls[0],
      );

      return (
        <div className="h-14 w-14 overflow-hidden rounded-md border bg-muted">
          {coverImage ? (
            <AppImage
              src={coverImage}
              alt={item.title || "Gallery cover"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    meta: { title: "Title" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[220px] truncate">{row.getValue("title")}</div>
    ),
  },
  {
    id: "category",
    meta: { title: "Category" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const category = row.original.category;
      return (
        <Badge variant="secondary" className="gap-1">
          <Tag className="h-3 w-3" />
          {category.name}
        </Badge>
      );
    },
  },
  {
    id: "imageCount",
    meta: { title: "Images" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Images" />
    ),
    cell: ({ row }) => {
      const count = row.original.imageCount ?? row.original.imageUrls.length;
      return <div className="font-medium">{count}</div>;
    },
  },
  {
    accessorKey: "occurredAt",
    meta: { title: "Occurred At" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Occurred At" />
    ),
    cell: ({ row }) => {
      const occurredAt = row.original.occurredAt;
      return occurredAt ? (
        <div className="max-w-[140px] truncate text-sm">
          {humanizeDate(occurredAt) || ""}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground italic">-</span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    meta: { title: "Created At" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[140px] truncate text-sm">
        {humanizeDate(row.getValue("createdAt")) || ""}
      </div>
    ),
  },
  {
    id: "actions",
    meta: { title: "Actions" },
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
