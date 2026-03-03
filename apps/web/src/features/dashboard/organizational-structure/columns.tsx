import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";

import type { OrgMember } from "./lib/org-schema";

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

const SERVER_BASE_URL = (API_BASE_URL ?? "").replace(/\/$/, "");

const resolveImageUrl = (imageUrl?: string | null) =>
  imageUrl
    ? imageUrl.startsWith("/")
      ? `${SERVER_BASE_URL}${imageUrl}`
      : imageUrl
    : "";

export const Columns = (
  onView: (member: OrgMember) => void,
  onEdit: (member: OrgMember) => void,
  onDelete: (member: OrgMember) => void,
): ColumnDef<OrgMember>[] => [
  {
    accessorKey: "headshotUrl",
    meta: {
      title: "Headshot",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Headshot" />
    ),
    cell: ({ row }) => {
      const url = resolveImageUrl(row.getValue("headshotUrl") as string | null);
      return url ? (
        <AppImage
          src={url}
          alt="Headshot"
          className="h-10 w-10 rounded-full object-cover border"
        />
      ) : (
        <div className="h-10 w-10 rounded-full border flex items-center justify-center text-[11px] text-muted-foreground">
          N/A
        </div>
      );
    },
  },
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
    accessorKey: "firstName",
    meta: {
      title: "First Name",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First Name" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate font-medium">
        {row.getValue("firstName")}
      </div>
    ),
  },
  {
    accessorKey: "lastName",
    meta: {
      title: "Last Name",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Name" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate font-medium">
        {row.getValue("lastName")}
      </div>
    ),
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
      <div className="max-w-[200px] truncate text-muted-foreground">
        {row.getValue("title")}
      </div>
    ),
  },
  {
    accessorKey: "managerId",
    meta: {
      title: "Manager",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Manager" />
    ),
    cell: ({ row }) => {
      const managerId = row.getValue("managerId") as number | null;
      return (
        <div className="text-sm text-muted-foreground">
          {managerId ? `Manager ID: ${managerId}` : "No Manager"}
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
      const member = row.original;

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
              <DropdownMenuItem onClick={() => onView(member)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(member)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit{" "}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(member)}>
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
