import { VacancyForm } from "../components/vacancy-form";
import { useVacancyByIdQuery } from "../lib/vacancies-query";

interface VacancyDetailProps {
  vacancyId: number;
  mode: "edit" | "view";
}

export default function VacancyDetail({ vacancyId, mode }: VacancyDetailProps) {
  const { data, isPending, isError, error } = useVacancyByIdQuery(vacancyId);

  if (isPending) {
    return <div className="p-8">Loading vacancy...</div>;
  }

  if (isError || !data?.data) {
    return (
      <div className="p-8 text-destructive">
        Failed to load vacancy{error ? `: ${error.message}` : ""}
      </div>
    );
  }

  const vacancy = data.data;

  return (
    <VacancyForm
      mode={mode}
      initialData={{
        id: vacancy.id,
        slug: vacancy.slug,
        title: vacancy.title,
        excerpt: vacancy.excerpt ?? "",
        description: vacancy.description,
        department: vacancy.department ?? "",
        location: vacancy.location ?? "",
        workplaceType: vacancy.workplaceType ?? undefined,
        employmentType: vacancy.employmentType ?? undefined,
        seniority: vacancy.seniority ?? undefined,
        salaryMin: vacancy.salaryMin ?? undefined,
        salaryMax: vacancy.salaryMax ?? undefined,
        salaryCurrency: vacancy.salaryCurrency ?? "",
        externalApplyUrl: vacancy.externalApplyUrl ?? "",
        applyEmail: vacancy.applyEmail ?? "",
        status: vacancy.status,
        publishedAt: vacancy.publishedAt,
        deadlineAt: vacancy.deadlineAt,
        tagIds: vacancy.tags?.map((tag) => tag.id) ?? [],
        featuredImageUrl: vacancy.featuredImageUrl ?? null,
      }}
      initialTags={vacancy.tags}
    />
  );
}
