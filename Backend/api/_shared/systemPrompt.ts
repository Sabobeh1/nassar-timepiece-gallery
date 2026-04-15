import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

let cached: string | null = null;

export function loadSystemPrompt(briefFile = "nassar.md"): string {
  if (cached) return cached;
  const path = join(here, "..", "..", "brief", briefFile);
  cached = readFileSync(path, "utf8");
  return cached;
}
