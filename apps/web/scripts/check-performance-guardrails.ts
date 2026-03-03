import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const WEB_SRC_DIR = path.resolve(import.meta.dir, "../src");
const ROUTES_DIR = path.join(WEB_SRC_DIR, "routes");
const ROOT_ROUTE_FILE = path.join(ROUTES_DIR, "__root.tsx");
const DEVTOOLS_PACKAGES = [
  "@tanstack/react-query-devtools",
  "@tanstack/react-router-devtools",
];
const DEFAULT_DUPLICATE_MIN_LINES = 180;

type Issue = {
  check: string;
  message: string;
};

function parseDuplicateMinLines(): number {
  const raw = process.env.WEB_DUPLICATE_COMPONENT_MIN_LINES;

  if (!raw) {
    return DEFAULT_DUPLICATE_MIN_LINES;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid WEB_DUPLICATE_COMPONENT_MIN_LINES value: ${raw}. Provide a positive number.`,
    );
  }

  return parsed;
}

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await walkFiles(fullPath);
      files.push(...nested);
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

function getLineFromIndex(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}

function normalizeSource(source: string): string {
  const withoutBlockComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const withoutLineComments = withoutBlockComments.replace(/\/\/.*$/gm, "");
  return withoutLineComments.replace(/\s+/g, "");
}

async function checkDevtoolsUsage(files: string[]): Promise<Issue[]> {
  const issues: Issue[] = [];
  const rootSource = await readFile(ROOT_ROUTE_FILE, "utf8");

  for (const pkg of DEVTOOLS_PACKAGES) {
    const hasDynamicImport = rootSource.includes(`import("${pkg}")`);
    if (!hasDynamicImport) {
      issues.push({
        check: "devtools-gating",
        message: `Missing dynamic import for ${pkg} in ${ROOT_ROUTE_FILE}`,
      });
    }

    const staticImportPattern = new RegExp(`from\\s+["']${pkg}["']`);
    if (staticImportPattern.test(rootSource)) {
      issues.push({
        check: "devtools-gating",
        message: `Static import for ${pkg} is not allowed in ${ROOT_ROUTE_FILE}`,
      });
    }
  }

  if (!rootSource.includes("import.meta.env.DEV")) {
    issues.push({
      check: "devtools-gating",
      message: `Root route must gate devtools with import.meta.env.DEV in ${ROOT_ROUTE_FILE}`,
    });
  }

  for (const filePath of files) {
    if (!/\.(ts|tsx|js|jsx)$/.test(filePath)) {
      continue;
    }
    if (filePath === ROOT_ROUTE_FILE) {
      continue;
    }

    const source = await readFile(filePath, "utf8");
    for (const pkg of DEVTOOLS_PACKAGES) {
      if (source.includes(pkg)) {
        issues.push({
          check: "devtools-gating",
          message: `Devtools package ${pkg} is only allowed in ${ROOT_ROUTE_FILE}, found in ${filePath}`,
        });
      }
    }
  }

  return issues;
}

async function checkRouteExportStars(routeFiles: string[]): Promise<Issue[]> {
  const issues: Issue[] = [];

  for (const filePath of routeFiles) {
    const source = await readFile(filePath, "utf8");
    const matches = source.matchAll(/^\s*export\s*\*/gm);
    for (const match of matches) {
      const index = match.index ?? 0;
      const line = getLineFromIndex(source, index);
      issues.push({
        check: "route-export-star",
        message: `export * is not allowed in route entry surfaces (${filePath}:${line})`,
      });
    }
  }

  return issues;
}

async function checkDuplicateLargeComponents(
  files: string[],
  minLines: number,
): Promise<Issue[]> {
  const issues: Issue[] = [];
  const byHash = new Map<
    string,
    { files: string[]; lineCounts: Map<string, number> }
  >();

  for (const filePath of files) {
    if (!/\.(tsx|jsx)$/.test(filePath)) {
      continue;
    }

    const source = await readFile(filePath, "utf8");
    const lineCount = source.split("\n").length;
    if (lineCount < minLines) {
      continue;
    }

    const normalized = normalizeSource(source);
    if (!normalized) {
      continue;
    }

    const hash = createHash("sha256").update(normalized).digest("hex");
    const existing = byHash.get(hash);

    if (existing) {
      existing.files.push(filePath);
      existing.lineCounts.set(filePath, lineCount);
      continue;
    }

    byHash.set(hash, {
      files: [filePath],
      lineCounts: new Map([[filePath, lineCount]]),
    });
  }

  for (const entry of byHash.values()) {
    if (entry.files.length < 2) {
      continue;
    }

    const details = entry.files
      .map(
        (filePath) => `${filePath} (${entry.lineCounts.get(filePath)} lines)`,
      )
      .join(", ");

    issues.push({
      check: "duplicate-large-component",
      message: `Duplicate large component bodies detected: ${details}`,
    });
  }

  return issues;
}

async function main() {
  const duplicateMinLines = parseDuplicateMinLines();
  const allSourceFiles = await walkFiles(WEB_SRC_DIR);
  const routeFiles = allSourceFiles.filter((filePath) =>
    filePath.startsWith(ROUTES_DIR),
  );

  const [devtoolsIssues, exportStarIssues, duplicateIssues] = await Promise.all(
    [
      checkDevtoolsUsage(allSourceFiles),
      checkRouteExportStars(routeFiles),
      checkDuplicateLargeComponents(allSourceFiles, duplicateMinLines),
    ],
  );

  const issues = [...devtoolsIssues, ...exportStarIssues, ...duplicateIssues];

  if (issues.length === 0) {
    process.stdout.write(
      "[perf:lint] All performance guardrail checks passed.\n",
    );
    return;
  }

  process.stderr.write(
    `[perf:lint] Performance guardrail checks failed (${issues.length}):\n`,
  );
  for (const issue of issues) {
    process.stderr.write(`- [${issue.check}] ${issue.message}\n`);
  }

  process.exitCode = 1;
}

await main();
