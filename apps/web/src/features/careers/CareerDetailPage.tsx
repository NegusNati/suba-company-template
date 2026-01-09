import { Link } from "@tanstack/react-router";

import { VacancyApplicationForm } from "./components/VacancyApplicationForm";
import type { PublicVacancyDetail } from "./lib/careers-schema";

import { LexicalViewer } from "@/components/common/rich-text/LexicalViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { humanizeDate } from "@/utils/dateHuman";

interface CareerDetailPageProps {
  vacancy: PublicVacancyDetail;
}

export function CareerDetailPage({ vacancy }: CareerDetailPageProps) {
  const isOpen = vacancy.canApply;

  return (
    <div className="w-full min-h-screen pb-20">
      <div className="px-6 py-10 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-3">
          <Link to={"/careers" as never}>
            <Button variant="ghost" className="px-0">
              Back to Careers
            </Button>
          </Link>
          <Badge variant={isOpen ? "default" : "outline"}>
            {isOpen ? "Open" : "Closed"}
          </Badge>
        </div>

        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-serif font-semibold tracking-tight">
            {vacancy.title}
          </h1>
          {vacancy.excerpt && (
            <p className="text-sm text-muted-foreground">{vacancy.excerpt}</p>
          )}

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {vacancy.department && <span>{vacancy.department}</span>}
            {vacancy.location && <span>{vacancy.location}</span>}
            {vacancy.employmentType && <span>{vacancy.employmentType}</span>}
            {vacancy.workplaceType && <span>{vacancy.workplaceType}</span>}
            {vacancy.seniority && <span>{vacancy.seniority}</span>}
            {vacancy.deadlineAt && (
              <span>Deadline: {humanizeDate(vacancy.deadlineAt, true)}</span>
            )}
          </div>
        </header>

        {(vacancy.externalApplyUrl || vacancy.applyEmail) && isOpen && (
          <div className="rounded-xl border p-4 space-y-2">
            <div className="text-sm font-medium">Apply options</div>
            <div className="flex flex-wrap gap-2">
              {vacancy.externalApplyUrl && (
                <a
                  href={vacancy.externalApplyUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button>Apply externally</Button>
                </a>
              )}
              {vacancy.applyEmail && (
                <a href={`mailto:${vacancy.applyEmail}`}>
                  <Button variant="outline">Apply via email</Button>
                </a>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              You can also apply using the form below.
            </p>
          </div>
        )}

        <section className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Job description</h2>
          <LexicalViewer content={vacancy.description} />
        </section>

        <section className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Apply</h2>
          {!isOpen ? (
            <p className="text-sm text-muted-foreground">
              This role is currently closed for applications.
            </p>
          ) : (
            <VacancyApplicationForm vacancyId={vacancy.id} />
          )}
        </section>
      </div>
    </div>
  );
}
