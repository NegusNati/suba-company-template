import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";

import type { Partner } from "./lib/partners-schema";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/features/dashboard/components/table/DataTableColumnHeader";
import { API_BASE_URL } from "@/lib/api-base";

export const Columns = (
  onView: (partner: Partner) => void,
  onEdit: (partner: Partner) => void,
  onDelete: (partner: Partner) => void,
): ColumnDef<Partner>[] => [
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
    accessorKey: "websiteUrl",
    meta: {
      title: "Website URL",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Website URL" />
    ),
    cell: ({ row }) => {
      const url = row.getValue("websiteUrl") as string | null | undefined;
      if (!url) {
        return (
          <div className="max-w-[200px] truncate text-muted-foreground">
            <span className="italic text-xs text-muted-foreground">
              No website
            </span>
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
            {url.replace(/^https?:\/\//, "")}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "logoUrl",
    meta: {
      title: "Logo",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Logo" />
    ),
    cell: ({ row }) => {
      const imageUrl = row.getValue("logoUrl") as string | null;
      const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
      const resolvedUrl =
        imageUrl && imageUrl.startsWith("/")
          ? `${baseUrl}${imageUrl}`
          : (imageUrl ?? "");
      return (
        <div className="max-w-[100px]">
          {resolvedUrl ? (
            <img
              src={resolvedUrl}
              alt="Logo"
              className="h-12 w-24 rounded object-cover"
            />
          ) : (
            <div className="h-12 w-24 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
              No Image
            </div>
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
      const partner = row.original;

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
              <DropdownMenuItem onClick={() => onView(partner)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(partner)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit{" "}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(partner)}>
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
