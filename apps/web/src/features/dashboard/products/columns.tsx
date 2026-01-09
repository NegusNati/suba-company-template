import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";

import type { Product } from "./lib/products-schema";

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
  onView: (product: Product) => void,
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void,
): ColumnDef<Product>[] => [
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
    accessorKey: "description",
    meta: {
      title: "Description",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[250px] truncate text-sm text-muted-foreground">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "overview",
    meta: {
      title: "Overview",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Overview" />
    ),
    cell: ({ row }) => {
      const overview = row.getValue("overview") as string | null;
      return (
        <div className="max-w-[250px] truncate text-sm text-muted-foreground">
          {overview || <span className="italic text-xs">No overview</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "productLink",
    meta: {
      title: "Product Link",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product Link" />
    ),
    cell: ({ row }) => {
      const url = row.getValue("productLink") as string | null;
      if (!url) {
        return (
          <div className="max-w-[200px] truncate text-xs text-muted-foreground">
            No link
          </div>
        );
      }
      return (
        <div className="max-w-[200px] truncate text-muted-foreground">
          <Link
            to={url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
            tabIndex={0}
            title={url}
          >
            {url.replace(/^https?:\/\//, "").slice(0, 30)}...
          </Link>
        </div>
      );
    },
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
      const tags = row.getValue("tags") as Product["tags"];
      return (
        <div className="max-w-[200px]">
          {tags && Array.isArray(tags) && tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                >
                  {tag.name}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No tag</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "images",
    meta: {
      title: "Images",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Images" />
    ),
    cell: ({ row }) => {
      const images = row.getValue("images") as Product["images"];
      const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
      const resolveImageUrl = (imageUrl?: string | null) =>
        imageUrl
          ? imageUrl.startsWith("/")
            ? `${baseUrl}${imageUrl}`
            : imageUrl
          : "";
      return (
        <div className="max-w-[100px]">
          {images && images.length > 0 ? (
            <div className="flex items-center space-x-1">
              <img
                src={resolveImageUrl(images[0].imageUrl)}
                alt="Product"
                className="h-8 w-8 rounded object-cover"
              />
              {images.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  +{images.length - 1}
                </span>
              )}
            </div>
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
    accessorKey: "createdAt",
    meta: {
      title: "Created At",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[120px] truncate">
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
      const product = row.original;

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
              <DropdownMenuItem onClick={() => onView(product)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit{" "}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(product)}>
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
