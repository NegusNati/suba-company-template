import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";

import type { Testimonial } from "./lib/testimonials-schema";

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

// Helper to get full image URL
const getImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return url.startsWith("/") ? `${baseUrl}${url}` : url;
};

export const Columns = (
  onView: (testimonial: Testimonial) => void,
  onEdit: (testimonial: Testimonial) => void,
  onDelete: (testimonial: Testimonial) => void,
): ColumnDef<Testimonial>[] => [
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
    accessorKey: "comment",
    meta: {
      title: "Comment",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Comment" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate text-sm">
        {row.getValue("comment")}
      </div>
    ),
  },
  {
    accessorKey: "companyName",
    meta: {
      title: "Company",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate font-medium">
        {row.getValue("companyName")}
      </div>
    ),
  },
  {
    accessorKey: "spokePersonName",
    meta: {
      title: "Spoke Person",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Spoke Person" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">
        {row.getValue("spokePersonName")}
      </div>
    ),
  },
  {
    accessorKey: "spokePersonTitle",
    meta: {
      title: "Title",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-muted-foreground">
        {row.getValue("spokePersonTitle")}
      </div>
    ),
  },
  {
    accessorKey: "partner",
    meta: {
      title: "Partner",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Partner" />
    ),
    cell: ({ row }) => {
      const partner = row.getValue("partner") as Testimonial["partner"];
      return (
        <div className="max-w-[200px] truncate">
          {partner ? (
            <span className="text-sm font-medium">{partner.title}</span>
          ) : (
            <span className="text-xs text-muted-foreground">No partner</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "companyLogoUrl",
    meta: {
      title: "Company Logo",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company Logo" />
    ),
    cell: ({ row }) => {
      const imageUrl = row.getValue("companyLogoUrl") as string | null;
      const resolvedUrl = getImageUrl(imageUrl);
      return (
        <div className="max-w-[100px]">
          {resolvedUrl ? (
            <img
              src={resolvedUrl}
              alt="Company Logo"
              className="h-8 w-8 rounded object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
              No Logo
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "spokePersonHeadshotUrl",
    meta: {
      title: "Headshot",
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Headshot" />
    ),
    cell: ({ row }) => {
      const imageUrl = row.getValue("spokePersonHeadshotUrl") as string | null;
      const resolvedUrl = getImageUrl(imageUrl);
      return (
        <div className="max-w-[100px]">
          {resolvedUrl ? (
            <img
              src={resolvedUrl}
              alt="Headshot"
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
              No Photo
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
      const testimonial = row.original;

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
              <DropdownMenuItem onClick={() => onView(testimonial)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(testimonial)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit{" "}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(testimonial)}>
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
