import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { fireEvent, render, cleanup } from "@testing-library/react";
import React, { Profiler, type ReactNode } from "react";
import { afterEach, describe, expect, test } from "vitest";

import { DataTable } from "../src/features/dashboard/components/table/DataTable";
import { FaqForm } from "../src/features/dashboard/faqs/FaqForm";
import { SocialForm } from "../src/features/dashboard/socials/SocialForm";
import { TagForm } from "../src/features/dashboard/tags/TagForm";

if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  globalThis.ResizeObserver = ResizeObserver;
}

type ProfileSample = {
  id: string;
  phase: "mount" | "update";
  actualDuration: number;
  commitTime: number;
};

type ProfileSummary = {
  id: string;
  commits: number;
  mountCommits: number;
  updateCommits: number;
  avgActualMs: number;
  avgUpdateMs: number;
  maxActualMs: number;
};

type TableRow = {
  id: number;
  name: string;
  status: string;
};

afterEach(() => {
  cleanup();
});

const makeClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (node: ReactNode) => {
  const client = makeClient();
  return render(
    <QueryClientProvider client={client}>{node}</QueryClientProvider>,
  );
};

const round = (value: number) => Math.round(value * 100) / 100;

const summarize = (samples: ProfileSample[]): ProfileSummary[] => {
  const grouped = new Map<string, ProfileSample[]>();

  for (const sample of samples) {
    if (!grouped.has(sample.id)) {
      grouped.set(sample.id, []);
    }
    grouped.get(sample.id)?.push(sample);
  }

  return Array.from(grouped.entries())
    .map(([id, entries]) => {
      const updates = entries.filter((entry) => entry.phase === "update");
      const avgActual =
        entries.reduce((sum, entry) => sum + entry.actualDuration, 0) /
        entries.length;
      const avgUpdate =
        updates.length > 0
          ? updates.reduce((sum, entry) => sum + entry.actualDuration, 0) /
            updates.length
          : 0;
      const maxActual = Math.max(
        ...entries.map((entry) => entry.actualDuration),
      );

      return {
        id,
        commits: entries.length,
        mountCommits: entries.filter((entry) => entry.phase === "mount").length,
        updateCommits: updates.length,
        avgActualMs: round(avgActual),
        avgUpdateMs: round(avgUpdate),
        maxActualMs: round(maxActual),
      };
    })
    .sort((a, b) => b.maxActualMs - a.maxActualMs);
};

const buildReport = (summaries: ProfileSummary[]) => {
  const now = new Date().toISOString();
  const rows = summaries
    .map(
      (summary) =>
        `| ${summary.id} | ${summary.commits} | ${summary.mountCommits} | ${summary.updateCommits} | ${summary.avgActualMs} | ${summary.avgUpdateMs} | ${summary.maxActualMs} |`,
    )
    .join("\n");

  const topThree = summaries.slice(0, 3);
  const topList =
    topThree.length > 0
      ? topThree
          .map(
            (summary, index) =>
              `${index + 1}. ${summary.id} (max ${summary.maxActualMs}ms, avg update ${summary.avgUpdateMs}ms)`,
          )
          .join("\n")
      : "1. No profiler data captured.";

  return `# Wave 4 Dashboard Profiling Report

Generated: ${now}
Environment: Vitest + jsdom synthetic render profiling using React Profiler.

## Component Summary

| Component | Commits | Mount | Update | Avg Actual (ms) | Avg Update (ms) | Max Actual (ms) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${rows}

## Highest Cost Components (Synthetic)

${topList}

## Notes

- These numbers are synthetic and best used for relative comparison across dashboard tables/forms.
- Real browser profiling should still be done on authenticated dashboard pages for final tuning.
`;
};

describe("wave 4 dashboard profiling", () => {
  test("profiles representative dashboard table and forms and writes report", () => {
    const samples: ProfileSample[] = [];

    const onRender = (
      id: string,
      phase: "mount" | "update",
      actualDuration: number,
      _baseDuration: number,
      _startTime: number,
      commitTime: number,
    ) => {
      samples.push({
        id,
        phase,
        actualDuration,
        commitTime,
      });
    };

    const tableColumns: ColumnDef<TableRow>[] = [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "status", header: "Status" },
    ];

    const tableData: TableRow[] = Array.from({ length: 30 }, (_, index) => ({
      id: index + 1,
      name: `Row ${index + 1}`,
      status: index % 2 === 0 ? "active" : "draft",
    }));

    const tableRender = renderWithProviders(
      <Profiler id="DataTable" onRender={onRender}>
        <DataTable<TableRow, unknown>
          tableTitle="Profile"
          columns={tableColumns}
          data={tableData}
          searchKey="name"
          searchValue=""
          onSearchChange={() => {}}
        />
      </Profiler>,
    );

    fireEvent.click(tableRender.getByText("Row 1"));

    tableRender.rerender(
      <QueryClientProvider client={makeClient()}>
        <Profiler id="DataTable" onRender={onRender}>
          <DataTable<TableRow, unknown>
            tableTitle="Profile"
            columns={tableColumns}
            data={tableData.slice(0, 12)}
            searchKey="name"
            searchValue="row"
            onSearchChange={() => {}}
          />
        </Profiler>
      </QueryClientProvider>,
    );
    tableRender.unmount();

    const faqRender = renderWithProviders(
      <Profiler id="FaqForm" onRender={onRender}>
        <FaqForm mode="create" onClose={() => {}} />
      </Profiler>,
    );
    fireEvent.change(faqRender.getByLabelText("Question"), {
      target: { value: "How long does delivery take?" },
    });
    fireEvent.change(faqRender.getByLabelText("Answer"), {
      target: { value: "Typically 2-4 weeks." },
    });
    faqRender.rerender(
      <QueryClientProvider client={makeClient()}>
        <Profiler id="FaqForm" onRender={onRender}>
          <FaqForm
            mode="edit"
            faq={{
              id: 11,
              question: "Updated question",
              answer: "Updated answer",
              slug: "updated-question",
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
            onClose={() => {}}
          />
        </Profiler>
      </QueryClientProvider>,
    );
    faqRender.unmount();

    const tagRender = renderWithProviders(
      <Profiler id="TagForm" onRender={onRender}>
        <TagForm mode="create" onClose={() => {}} />
      </Profiler>,
    );
    fireEvent.change(tagRender.getByLabelText("Tag Name"), {
      target: { value: "Web" },
    });
    tagRender.rerender(
      <QueryClientProvider client={makeClient()}>
        <Profiler id="TagForm" onRender={onRender}>
          <TagForm
            mode="edit"
            tag={{
              id: 4,
              name: "Branding",
              slug: "branding",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
            onClose={() => {}}
          />
        </Profiler>
      </QueryClientProvider>,
    );
    tagRender.unmount();

    const socialRender = renderWithProviders(
      <Profiler id="SocialForm" onRender={onRender}>
        <SocialForm mode="create" onClose={() => {}} />
      </Profiler>,
    );
    fireEvent.change(socialRender.getByLabelText("Title"), {
      target: { value: "LinkedIn" },
    });
    fireEvent.change(socialRender.getByLabelText("Base URL"), {
      target: { value: "https://linkedin.com" },
    });
    socialRender.rerender(
      <QueryClientProvider client={makeClient()}>
        <Profiler id="SocialForm" onRender={onRender}>
          <SocialForm
            mode="edit"
            social={{
              id: 3,
              title: "LinkedIn",
              baseUrl: "https://linkedin.com",
              iconUrl: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
            onClose={() => {}}
          />
        </Profiler>
      </QueryClientProvider>,
    );
    socialRender.unmount();

    const summaries = summarize(samples);
    const report = buildReport(summaries);
    const reportPath = resolve(
      process.cwd(),
      "../../docs/wave4-profile-report.md",
    );

    writeFileSync(reportPath, report, "utf8");

    expect(samples.length).toBeGreaterThan(0);
    expect(summaries.find((entry) => entry.id === "DataTable")).toBeDefined();
    expect(summaries.find((entry) => entry.id === "FaqForm")).toBeDefined();
    expect(summaries.find((entry) => entry.id === "TagForm")).toBeDefined();
    expect(summaries.find((entry) => entry.id === "SocialForm")).toBeDefined();
  });
});
