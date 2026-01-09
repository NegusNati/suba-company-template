import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";

import type { Faq } from "./lib/faqs-schema";

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
  onView: (faq: Faq) => void,
  onEdit: (faq: Faq) => void,
  onDelete: (faq: Faq) => void,
): ColumnDef<Faq>[] => [
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
    accessorKey: "question",
    meta: {
      title: "Question",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Question" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue("question")}
      </div>
    ),
  },
  {
    accessorKey: "answer",
    meta: {
      title: "Answer",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Answer" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate text-sm text-muted-foreground">
        {row.getValue("answer")}
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    meta: {
      title: "Status",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <div className="max-w-[100px]">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
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
      const faq = row.original;

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
              <DropdownMenuItem onClick={() => onView(faq)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(faq)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit{" "}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(faq)}>
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
