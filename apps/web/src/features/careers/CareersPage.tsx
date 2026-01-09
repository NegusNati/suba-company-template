import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useCareersListQuery } from "./lib/careers-query";

import GojoSvg from "@/assets/vacancy/gojo.svg";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/use-debounce";
import { humanizeDate } from "@/utils/dateHuman";

export function CareersPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  const { data, isPending, isError, error } = useCareersListQuery({
    page: 1,
    limit: 50,
    search: debouncedQuery || undefined,
  });

  const roles = useMemo(() => data?.data ?? [], [data?.data]);

  const [openRoles, closedRoles] = useMemo(() => {
    const open = roles.filter((r) => r.canApply);
    const closed = roles.filter((r) => !r.canApply);
    return [open, closed];
  }, [roles]);

  return (
    <div className="w-full min-h-screen pb-20">
      <PageHeader image={GojoSvg} imageAlt="gojo" />
      <div className="px-6 py-1 max-w-6xl mx-auto space-y-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-semibold tracking-tight">
              Careers
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore open roles and learn how you can help us build.
            </p>
          </div>

          <div className="w-full md:w-[360px]">
            <Input
              placeholder="Search roles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </header>

        {isPending && (
          <p className="text-sm text-muted-foreground">Loading roles…</p>
        )}
        {isError && (
          <p className="text-sm text-destructive">
            Failed to load roles{error ? `: ${error.message}` : ""}
          </p>
        )}

        {!isPending && !isError && roles.length === 0 && (
          <div className="rounded-2xl border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No roles found. Try a different search.
            </p>
          </div>
        )}

        {openRoles.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Open roles</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {openRoles.map((role) => (
                <Link
                  key={role.id}
                  to="/demo/careers/$slug"
                  params={{ slug: role.slug }}
                  onClick={() => {
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="group rounded-2xl border p-6 hover:border-primary/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold group-hover:text-primary">
                        {role.title}
                      </h3>
                      {role.excerpt && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {role.excerpt}
                        </p>
                      )}
                    </div>
                    <Badge>Open</Badge>
                  </div>

                  <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {role.department && <span>{role.department}</span>}
                      {role.location && <span>{role.location}</span>}
                      {role.employmentType && (
                        <span>{role.employmentType}</span>
                      )}
                      {role.workplaceType && <span>{role.workplaceType}</span>}
                    </div>
                    {role.deadlineAt && (
                      <div>Deadline: {humanizeDate(role.deadlineAt, true)}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {closedRoles.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Closed roles</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {closedRoles.map((role) => (
                <Link
                  key={role.id}
                  to="/demo/careers/$slug"
                  params={{ slug: role.slug }}
                  onClick={() => {
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="group rounded-2xl border p-6 opacity-80 hover:opacity-100 hover:border-border transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold">{role.title}</h3>
                      {role.excerpt && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {role.excerpt}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">Closed</Badge>
                  </div>

                  <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {role.department && <span>{role.department}</span>}
                      {role.location && <span>{role.location}</span>}
                      {role.employmentType && (
                        <span>{role.employmentType}</span>
                      )}
                      {role.workplaceType && <span>{role.workplaceType}</span>}
                    </div>
                    {role.deadlineAt && (
                      <div>Deadline: {humanizeDate(role.deadlineAt, true)}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {query.length > 0 && (
          <div className="flex justify-center pt-6">
            <Button variant="outline" onClick={() => setQuery("")}>
              Clear search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
