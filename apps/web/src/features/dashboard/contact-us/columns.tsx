import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Eye, Trash2, XCircle } from "lucide-react";

import type { Contact } from "./lib/contact-schema";

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

/**
 * Create contact table columns with action handlers
 */
export const Columns = (
  onView: (contact: Contact) => void,
  onToggleStatus: (contact: Contact) => void,
  onDelete: (contact: Contact) => void,
): ColumnDef<Contact>[] => [
  {
    accessorKey: "id",
    meta: {
      title: "ID",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[60px] font-medium">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "fullName",
    meta: {
      title: "Full Name",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Full Name" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[180px] truncate font-medium">
        {row.getValue("fullName")}
      </div>
    ),
  },
  {
    accessorKey: "contact",
    meta: {
      title: "Contact",
    },
    header: "Contact",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-sm">
        {row.getValue("contact")}
      </div>
    ),
  },
  {
    accessorKey: "message",
    meta: {
      title: "Message",
    },
    header: "Message",
    cell: ({ row }) => {
      const message = row.getValue("message") as string;
      return <div className="max-w-[250px] truncate text-sm">{message}</div>;
    },
  },
  {
    accessorKey: "isHandled",
    meta: {
      title: "Status",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isHandled = row.getValue("isHandled") as boolean;
      return (
        <Badge
          variant={isHandled ? "default" : "secondary"}
          className={`whitespace-nowrap ${isHandled ? "bg-green-600" : ""}`}
        >
          {isHandled ? (
            <>
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Handled
            </>
          ) : (
            <>
              <XCircle className="mr-1 h-3 w-3" />
              Pending
            </>
          )}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    meta: {
      title: "Created At",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[140px] truncate text-sm">
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
      const contact = row.original;
      const isHandled = contact.isHandled;

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
              <DropdownMenuItem onClick={() => onView(contact)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(contact)}>
                {isHandled ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Mark as Pending
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Handled
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(contact)}>
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
