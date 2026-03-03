import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";

import type { Social } from "./lib/socials-schema";

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
  onView: (social: Social) => void,
  onEdit: (social: Social) => void,
  onDelete: (social: Social) => void,
): ColumnDef<Social>[] => [
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
      <div className="max-w-[200px] truncate font-medium">
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "iconUrl",
    meta: {
      title: "Icon",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Icon" />
    ),
    cell: ({ row }) => {
      const iconUrl = row.getValue("iconUrl") as string;
      return (
        <div className="max-w-[100px]">
          {iconUrl ? (
            <AppImage
              src={API_BASE_URL + iconUrl}
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
    accessorKey: "baseUrl",
    meta: {
      title: "Base URL",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Base URL" />
    ),
    cell: ({ row }) => {
      const url = row.getValue("baseUrl") as string | null | undefined;
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
    accessorKey: "createdAt",
    meta: {
      title: "Created At",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
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
      const social = row.original;

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
              <DropdownMenuItem onClick={() => onView(social)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(social)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(social)}>
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
