import type { Tag } from "../../tags/lib/tags-schema";

import { LexicalViewer } from "@/components/common/rich-text/LexicalViewer";
import { humanizeDate } from "@/utils/dateHuman";

interface VacancyPreviewProps {
  title: string;
  excerpt: string;
  description: string;
  department?: string;
  location?: string;
  workplaceType?: string;
  employmentType?: string;
  seniority?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  externalApplyUrl?: string;
  applyEmail?: string;
  status?: string;
  publishedAt?: string;
  deadlineAt?: string;
  selectedTags: Tag[];
  imagePreviews: string[];
}

const formatSalary = (
  salaryMin?: number,
  salaryMax?: number,
  currency?: string,
) => {
  if (salaryMin == null && salaryMax == null) return null;
  const prefix = currency ? `${currency} ` : "";
  if (salaryMin != null && salaryMax != null) {
    return `${prefix}${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()}`;
  }
  if (salaryMin != null) {
    return `${prefix}${salaryMin.toLocaleString()}+`;
  }
  return salaryMax != null ? `${prefix}${salaryMax.toLocaleString()}` : null;
};

export default function VacancyPreview({
  title,
  excerpt,
  description,
  department,
  location,
  workplaceType,
  employmentType,
  seniority,
  salaryMin,
  salaryMax,
  salaryCurrency,
  externalApplyUrl,
  applyEmail,
  status,
  publishedAt,
  deadlineAt,
  selectedTags,
  imagePreviews,
}: VacancyPreviewProps) {
  const salary = formatSalary(salaryMin, salaryMax, salaryCurrency);
  const publishedLabel = publishedAt ? humanizeDate(publishedAt) : "Not set";
  const deadlineLabel = deadlineAt ? humanizeDate(deadlineAt, true) : "None";
  const statusLabel = status || "DRAFT";

  const metaItems = [
    department && { label: "Department", value: department },
    location && { label: "Location", value: location },
    workplaceType && { label: "Workplace", value: workplaceType },
    employmentType && { label: "Employment", value: employmentType },
    seniority && { label: "Seniority", value: seniority },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Preview</h2>
        <span className="text-xs text-muted-foreground">
          Status: {statusLabel}
        </span>
      </div>

      {imagePreviews[0] && (
        <div className="overflow-hidden rounded-lg border bg-muted">
          <img
            src={imagePreviews[0]}
            alt="Featured"
            className="h-48 w-full object-cover"
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">{title || "Vacancy title"}</h3>
          <p className="text-sm text-muted-foreground">
            {excerpt || "Short summary of the role..."}
          </p>
        </div>

        {metaItems.length > 0 && (
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {metaItems.map((item) => (
              <div key={item.label} className="flex flex-col">
                <span className="uppercase text-[10px] tracking-wide">
                  {item.label}
                </span>
                <span className="text-sm text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {salary && <span>Compensation: {salary}</span>}
          <span>•</span>
          <span>Published: {publishedLabel}</span>
          <span>•</span>
          <span>Deadline: {deadlineLabel}</span>
        </div>

        {(externalApplyUrl || applyEmail) && (
          <div className="text-xs text-muted-foreground">
            Apply via{" "}
            {externalApplyUrl ? (
              <span className="text-primary">external link</span>
            ) : (
              <span className="text-primary">{applyEmail}</span>
            )}
          </div>
        )}

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedTags.slice(0, 4).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary"
              >
                {tag.name}
              </span>
            ))}
            {selectedTags.length > 4 && (
              <span className="text-[10px] text-muted-foreground">
                +{selectedTags.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="prose prose-sm max-w-none">
        {description ? (
          <LexicalViewer content={description} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Role description will appear here as you type.
          </p>
        )}
      </div>
    </div>
  );
}
