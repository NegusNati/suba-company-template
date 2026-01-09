import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ResourceTable } from "../../components/ResourceTable";
import {
  useDeleteVacancyApplicationMutation,
  useUpdateVacancyApplicationMutation,
  useVacancyApplicationsQuery,
} from "../lib/vacancies-query";
import {
  vacancyApplicationStatusSchema,
  type VacancyApplication,
  type VacancyApplicationsListParams,
} from "../lib/vacancies-schema";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/lib/api-base";
import { humanizeDate } from "@/utils/dateHuman";

const resolveAssetUrl = (url?: string | null) => {
  if (!url) return "";
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return url.startsWith("/") ? `${baseUrl}${url}` : url;
};

type Props = {
  vacancyId: number;
  slug: string;
  search: Partial<VacancyApplicationsListParams>;
};

export function VacancyApplications({ vacancyId, slug, search }: Props) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<VacancyApplication | null>(null);

  const { data, isPending, isError, error } = useVacancyApplicationsQuery(
    vacancyId,
    search,
  );

  const updateMutation = useUpdateVacancyApplicationMutation({
    onSuccess: () => toast.success("Application updated successfully!"),
    onError: (mutationError) =>
      toast.error(`Failed to update application: ${mutationError.message}`),
  });

  const deleteMutation = useDeleteVacancyApplicationMutation({
    onSuccess: () => toast.success("Application deleted successfully!"),
    onError: (mutationError) =>
      toast.error(`Failed to delete application: ${mutationError.message}`),
  });

  const buildSearch = (overrides: Partial<VacancyApplicationsListParams>) => ({
    id: vacancyId,
    ...search,
    ...overrides,
  });

  const setPage = (page: number) =>
    navigate({
      to: "/dashboard/vacancies/$slug/applications",
      params: { slug },
      search: buildSearch({ page }),
    });

  const setLimit = (limit: number) =>
    navigate({
      to: "/dashboard/vacancies/$slug/applications",
      params: { slug },
      search: buildSearch({ limit, page: 1 }),
    });

  const setSearchValue = (value: string) =>
    navigate({
      to: "/dashboard/vacancies/$slug/applications",
      params: { slug },
      search: buildSearch({ search: value || undefined, page: 1 }),
    });

  const pagination = data?.meta?.pagination
    ? {
        pageCount: data.meta.pagination.totalPages,
        page: data.meta.pagination.page,
        limit: data.meta.pagination.limit,
        setPage,
        setLimit,
      }
    : undefined;

  const columns = useMemo<ColumnDef<VacancyApplication>[]>(
    () => [
      {
        accessorKey: "fullName",
        meta: { title: "Name" },
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.fullName}</div>
        ),
      },
      {
        accessorKey: "email",
        meta: { title: "Email" },
        header: "Email",
        cell: ({ row }) => (
          <div className="text-muted-foreground">{row.original.email}</div>
        ),
      },
      {
        accessorKey: "status",
        meta: { title: "Status" },
        header: "Status",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.status}</div>
        ),
      },
      {
        accessorKey: "createdAt",
        meta: { title: "Submitted" },
        header: "Submitted",
        cell: ({ row }) => (
          <div className="max-w-[160px] truncate">
            {humanizeDate(row.original.createdAt) || ""}
          </div>
        ),
      },
      {
        accessorKey: "resumeUrl",
        meta: { title: "Resume" },
        header: "Resume",
        cell: ({ row }) => {
          const url = resolveAssetUrl(row.original.resumeUrl);
          return url ? (
            <a
              className="text-primary underline underline-offset-4"
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              Download
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        id: "actions",
        meta: { title: "Action" },
        header: "Action",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelected(row.original)}
          >
            View
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Applications</h1>
        <Button
          variant="outline"
          onClick={() =>
            navigate({
              to: "/dashboard/vacancies/$slug",
              params: { slug },
              search: { id: vacancyId },
            })
          }
        >
          Back to Vacancy
        </Button>
      </div>

      <ResourceTable
        columns={columns}
        data={data?.data || []}
        pagination={pagination}
        isLoading={isPending}
        isError={isError}
        error={error}
        searchKey="fullName"
        searchValue={typeof search.search === "string" ? search.search : ""}
        onSearchChange={setSearchValue}
      />

      <ApplicationDialog
        application={selected}
        onClose={() => setSelected(null)}
        onUpdate={(payload) => {
          if (!selected) return;
          updateMutation.mutate({
            vacancyId,
            applicationId: selected.id,
            payload,
          });
        }}
        onDelete={() => {
          if (!selected) return;
          deleteMutation.mutate({ vacancyId, applicationId: selected.id });
          setSelected(null);
        }}
        isSaving={updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

type DialogProps = {
  application: VacancyApplication | null;
  onClose: () => void;
  onUpdate: (payload: {
    status?: VacancyApplication["status"];
    notes?: string;
  }) => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
};

function ApplicationDialog({
  application,
  onClose,
  onUpdate,
  onDelete,
  isSaving,
  isDeleting,
}: DialogProps) {
  const [status, setStatus] =
    useState<VacancyApplication["status"]>("SUBMITTED");
  const [notes, setNotes] = useState<string>("");

  const open = Boolean(application);

  useEffect(() => {
    if (!application) return;
    setStatus(application.status);
    setNotes(application.notes ?? "");
  }, [application]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            Review applicant information and update status/notes.
          </DialogDescription>
        </DialogHeader>

        {application && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Full name</div>
                <div className="font-medium">{application.fullName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="font-medium">{application.email}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Phone</div>
                <div className="font-medium">{application.phone || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Submitted</div>
                <div className="font-medium">
                  {humanizeDate(application.createdAt)}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Portfolio</div>
              {application.portfolioUrl ? (
                <a
                  className="text-primary underline underline-offset-4"
                  href={application.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {application.portfolioUrl}
                </a>
              ) : (
                <div className="text-muted-foreground">—</div>
              )}
            </div>

            <div>
              <div className="text-xs text-muted-foreground">LinkedIn</div>
              {application.linkedinUrl ? (
                <a
                  className="text-primary underline underline-offset-4"
                  href={application.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {application.linkedinUrl}
                </a>
              ) : (
                <div className="text-muted-foreground">—</div>
              )}
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Resume</div>
              {application.resumeUrl ? (
                <a
                  className="text-primary underline underline-offset-4"
                  href={resolveAssetUrl(application.resumeUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download resume
                </a>
              ) : (
                <div className="text-muted-foreground">—</div>
              )}
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Cover letter</div>
              <Textarea
                value={application.coverLetter ?? ""}
                readOnly
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <Select
                  value={status}
                  onValueChange={(val) =>
                    setStatus(val as VacancyApplication["status"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {vacancyApplicationStatusSchema.options.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Reviewed At</div>
                <Input value={humanizeDate(application.reviewedAt)} readOnly />
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">
                Notes (admin only)
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add internal notes..."
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting || isSaving}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
          <Button
            onClick={() => onUpdate({ status, notes })}
            disabled={isSaving || isDeleting}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
