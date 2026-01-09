import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2, UploadCloud, XCircle } from "lucide-react";
import type { ComponentProps } from "react";

import type { VacancyListItem } from "./lib/vacancies-schema";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/features/dashboard/components/table/DataTableColumnHeader";
import { humanizeDate } from "@/utils/dateHuman";

const getStatusVariant = (
  status: VacancyListItem["status"],
): ComponentProps<typeof Badge>["variant"] => {
  switch (status) {
    case "PUBLISHED":
      return "default";
    case "DRAFT":
      return "secondary";
    case "CLOSED":
      return "outline";
    case "ARCHIVED":
      return "destructive";
    default:
      return "secondary";
  }
};

export const Columns = (
  onView: (vacancy: VacancyListItem) => void,
  onEdit: (vacancy: VacancyListItem) => void,
  onDelete: (vacancy: VacancyListItem) => void,
  onChangeStatus: (
    vacancy: VacancyListItem,
    status: VacancyListItem["status"],
  ) => void,
): ColumnDef<VacancyListItem>[] => [
  {
    accessorKey: "id",
    meta: { title: "Id" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "title",
    meta: { title: "Title" },
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
    accessorKey: "status",
    meta: { title: "Status" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as VacancyListItem["status"];
      return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
    },
  },
  {
    accessorKey: "department",
    meta: { title: "Department" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-muted-foreground">
        {(row.getValue("department") as string | null) || "—"}
      </div>
    ),
  },
  {
    accessorKey: "location",
    meta: { title: "Location" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-muted-foreground">
        {(row.getValue("location") as string | null) || "—"}
      </div>
    ),
  },
  {
    accessorKey: "publishedAt",
    meta: { title: "Published" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Published" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[160px] truncate">
        {humanizeDate(row.getValue("publishedAt") as string | null) || ""}
      </div>
    ),
  },
  {
    accessorKey: "deadlineAt",
    meta: { title: "Deadline" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deadline" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[160px] truncate">
        {humanizeDate(row.getValue("deadlineAt") as string | null) || "—"}
      </div>
    ),
  },
  {
    accessorKey: "applicationCount",
    meta: { title: "Applications" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Applications" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("applicationCount")}</div>
    ),
  },
  {
    accessorKey: "tags",
    meta: { title: "Tags" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tags" />
    ),
    cell: ({ row }) => {
      const tags = row.getValue("tags") as VacancyListItem["tags"];
      return (
        <div className="max-w-[220px]">
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
    meta: { title: "Action" },
    header: "Action",
    cell: ({ row }) => {
      const vacancy = row.original;

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
              <DropdownMenuItem onClick={() => onView(vacancy)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(vacancy)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {vacancy.status !== "PUBLISHED" && (
                <DropdownMenuItem
                  onClick={() => onChangeStatus(vacancy, "PUBLISHED")}
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Publish
                </DropdownMenuItem>
              )}

              {vacancy.status === "PUBLISHED" && (
                <DropdownMenuItem
                  onClick={() => onChangeStatus(vacancy, "CLOSED")}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Close
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => onDelete(vacancy)}>
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
