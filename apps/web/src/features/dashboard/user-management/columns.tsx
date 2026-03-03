import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  Eye,
  Pencil,
  Trash2,
  UserCog,
  XCircle,
} from "lucide-react";

import type { User } from "./lib/users-schema";

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
  onView: (user: User) => void,
  onEdit: (user: User) => void,
  onAssignRole: (user: User) => void,
  onDelete: (user: User) => void,
): ColumnDef<User>[] => [
  {
    accessorKey: "id",
    meta: {
      title: "ID",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[100px] truncate font-medium">
        {row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "name",
    meta: {
      title: "Name",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
      const resolveImageUrl = (imageUrl?: string | null) =>
        imageUrl
          ? imageUrl.startsWith("/")
            ? `${baseUrl}${imageUrl}`
            : imageUrl
          : "";

      return (
        <div className="flex items-center gap-3">
          {user.image ? (
            <AppImage
              src={resolveImageUrl(user.image)}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="max-w-[200px] truncate font-medium">
            {row.getValue("name")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    meta: {
      title: "Email",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[250px] truncate text-sm">
        {row.getValue("email")}
      </div>
    ),
  },
  {
    accessorKey: "role",
    meta: {
      title: "Role",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as User["role"];
      const roleStyles = {
        admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        blogger:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        user: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      };
      const roleLabels = {
        admin: "Admin",
        blogger: "Blogger",
        user: "User",
      };

      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleStyles[role]}`}
        >
          {roleLabels[role]}
        </span>
      );
    },
  },
  {
    accessorKey: "emailVerified",
    meta: {
      title: "Email Verified",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Verified" />
    ),
    cell: ({ row }) => {
      const verified = row.getValue("emailVerified") as boolean;
      return (
        <div className="flex items-center">
          {verified ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-400" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "sessions",
    meta: {
      title: "Sessions",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sessions" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("sessions")}</div>
    ),
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
      const user = row.original;

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
              <DropdownMenuItem onClick={() => onView(user)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssignRole(user)}>
                <UserCog className="mr-2 h-4 w-4" />
                Assign Role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(user)}>
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
