import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";

import type { Blog } from "./lib/blogs-schema";

import { AppImage } from "@/components/common/AppImage";
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

export const Columns = (
  onView: (blog: Blog) => void,
  onEdit: (blog: Blog) => void,
  onDelete: (blog: Blog) => void,
): ColumnDef<Blog>[] => [
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
    accessorKey: "title",
    meta: {
      title: "Title",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("title")}
      </div>
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
      <div className="max-w-[200px] truncate text-muted-foreground">
        {row.getValue("slug")}
      </div>
    ),
  },
  {
    accessorKey: "excerpt",
    meta: {
      title: "Excerpt",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Excerpt" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[250px] truncate text-sm text-muted-foreground">
        {row.getValue("excerpt")}
      </div>
    ),
  },
  {
    accessorKey: "featuredImageUrl",
    meta: {
      title: "Featured Image",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Featured Image" />
    ),
    cell: ({ row }) => {
      const imageUrl = row.getValue("featuredImageUrl") as string | null;
      const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
      const resolveImageUrl = (url?: string | null) =>
        url ? (url.startsWith("/") ? `${baseUrl}${url}` : url) : "";

      const resolvedUrl = resolveImageUrl(imageUrl);
      return (
        <div className="max-w-[100px]">
          {resolvedUrl ? (
            <AppImage
              src={resolvedUrl}
              alt="Featured"
              className="h-8 w-8 rounded object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
              No Image
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "publishDate",
    meta: {
      title: "Publish Date",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Publish Date" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[120px] truncate">
        {humanizeDate(row.getValue("publishDate")) || ""}
      </div>
    ),
  },
  {
    accessorKey: "readTimeMinutes",
    meta: {
      title: "Read Time",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Read Time" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("readTimeMinutes")} min</div>
    ),
  },
  {
    accessorKey: "tags",
    meta: {
      title: "Tags",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tags" />
    ),
    cell: ({ row }) => {
      const tags = row.getValue("tags") as Blog["tags"];
      return (
        <div className="max-w-[200px]">
          {tags && tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                >
                  {tag.name}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{tags.length - 2} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No tags</span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    meta: {
      title: "Action",
    },
    header: "Action",
    cell: ({ row }) => {
      const blog = row.original;

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
              <DropdownMenuItem onClick={() => onView(blog)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(blog)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit{" "}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(blog)}>
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
