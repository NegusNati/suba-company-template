import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const DEFAULT_MAX_KB = 3760;

function parseMaxKb(): number {
  const raw = process.env.WEB_MAIN_CHUNK_MAX_KB;

  if (!raw) {
    return DEFAULT_MAX_KB;
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid WEB_MAIN_CHUNK_MAX_KB value: ${raw}. Provide a positive number.`,
    );
  }

  return parsed;
}

async function main() {
  const maxKb = parseMaxKb();
  const assetsDir = path.resolve(import.meta.dir, "../dist/assets");

  const files = await readdir(assetsDir);
  const indexChunks = files.filter(
    (fileName) => fileName.startsWith("index-") && fileName.endsWith(".js"),
  );

  if (indexChunks.length === 0) {
    throw new Error(`No index-*.js file found in ${assetsDir}`);
  }

  const stats = await Promise.all(
    indexChunks.map(async (fileName) => {
      const filePath = path.join(assetsDir, fileName);
      const fileStat = await stat(filePath);
      return {
        fileName,
        filePath,
        sizeBytes: fileStat.size,
      };
    }),
  );

  const mainChunk = stats.sort((a, b) => b.sizeBytes - a.sizeBytes)[0];
  const sizeKb = mainChunk.sizeBytes / 1024;

  process.stdout.write(
    `[perf:budget] Main chunk ${mainChunk.fileName}: ${sizeKb.toFixed(2)} KiB (limit: ${maxKb.toFixed(2)} KiB)\\n`,
  );

  if (sizeKb > maxKb) {
    throw new Error(
      `[perf:budget] Main chunk exceeds limit by ${(sizeKb - maxKb).toFixed(2)} KiB: ${mainChunk.filePath}`,
    );
  }
}

await main();
