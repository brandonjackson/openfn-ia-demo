import { readdirSync } from "node:fs";
import { join, parse } from "node:path";
import { describe, expect, it } from "vitest";

/** Every file under `dir`, as paths from it. */
function files(dir: string, prefix = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name), `${prefix}${e.name}/`) : [`${prefix}${e.name}`],
  );
}

describe("file names", () => {
  // On macOS and Windows, `./Markdown` can resolve to markdown.ts as well as Markdown.tsx, so an import
  // that works on Linux (and in CI) breaks there. No two modules in a folder may differ only by case.
  it("has no two modules in a folder whose import paths differ only by case", () => {
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const path of files("src")) {
      const { dir, name } = parse(path);
      // An import names a module without its extension; stories and tests are named apart (X.stories, X.test).
      const key = `${dir}/${name}`.toLowerCase();
      const other = seen.get(key);
      if (other !== undefined && other !== path) clashes.push(`${other} and ${path}`);
      else seen.set(key, path);
    }
    expect(clashes).toEqual([]);
  });
});
