#!/usr/bin/env node
/*
 * The ratchet. Counts the things the design system wants fewer of, and fails
 * when any count goes up against metrics.json. Lower a count, then run
 * `npm run metrics:update` and commit the new baseline: the numbers can only
 * go down. Why: see docs/architecture.md#the-ratchet.
 *
 *   npm run metrics          print the counts
 *   npm run metrics:check    fail if any count is above the baseline (CI runs this)
 *   npm run metrics:update   write the current counts as the new baseline
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { basename, join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const baselinePath = join(root, "metrics.json");

function files(dir, test) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...files(p, test));
    else if (test(p)) out.push(p);
  }
  return out;
}
const src = (p) => join(root, "src", p);
const isComponent = (p) =>
  p.endsWith(".tsx") && ![".stories.tsx", ".fixtures.tsx", ".query.tsx", ".test.tsx"].some((end) => p.endsWith(end));
const count = (paths, re) => paths.reduce((n, p) => n + (readFileSync(p, "utf8").match(re) ?? []).length, 0);

const tiers = { primitives: "Primitives", domain: "Domain", patterns: "Patterns" };
const tierFiles = (t) => files(src(`components/${t}`), isComponent);
const pageFiles = files(src("pages"), isComponent);
const className = /className=/g;

const metrics = {
  // Lint exceptions marked `debt:`. New work never adds one.
  debt: count(files(src(""), (p) => /\.(ts|tsx)$/.test(p)), /eslint-disable[^\n]*debt:/g),
  // Styling outside the primitives. A page or pattern that needs a look should get it from a component.
  classNamesInDomain: count(tierFiles("domain"), className),
  classNamesInPatterns: count(tierFiles("patterns"), className),
  classNamesInPages: count(pageFiles, className),
  // Hand-rolled controls in pages, where Button, FormControls and DataTable belong.
  rawControlsInPages: count(pageFiles, /<(button|input|select|textarea|table)\b/g),
  // Components without a story beside them.
  componentsWithoutStories: [...Object.keys(tiers).flatMap(tierFiles), ...pageFiles].filter(
    (p) => !existsSync(p.replace(/\.tsx$/, ".stories.tsx"))
  ).length,
};

// A hard rule, not a ratchet: every story's title is its layer and its name.
const titleErrors = [];
for (const [dir, tier] of [...Object.entries(tiers).map(([d, t]) => [`components/${d}`, t]), ["pages", "Pages"]]) {
  for (const p of files(src(dir), (f) => f.endsWith(".stories.tsx"))) {
    const text = readFileSync(p, "utf8");
    const meta = text.slice(text.search(/const meta[^=]*=\s*\{|export default \{/));
    const title = meta.match(/title:\s*"([^"]*)"/)?.[1];
    const want = `${tier}/${basename(p).split(".")[0]}`;
    if (title !== want) titleErrors.push(`${p.slice(root.length)}: title "${title}", expected "${want}"`);
  }
}

const mode = process.argv[2];
const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, "utf8")) : {};
let failed = false;
for (const [key, value] of Object.entries(metrics)) {
  const was = baseline[key];
  const note = was === undefined ? "" : value > was ? `  ✗ up from ${was}` : value < was ? `  ↓ from ${was}` : "";
  if (was !== undefined && value > was) failed = true;
  console.log(`${key.padEnd(26)} ${String(value).padStart(5)}${note}`);
}
if (titleErrors.length) {
  failed = true;
  console.log(`\nStory titles must be "<Layer>/<Name>", matching the folder:\n  ${titleErrors.join("\n  ")}`);
}

if (mode === "update") {
  writeFileSync(baselinePath, JSON.stringify(metrics, null, 2) + "\n");
  console.log(`\nWrote ${basename(baselinePath)}.`);
} else if (mode === "check" && failed) {
  console.log(
    "\nThe design system's counts can only go down. Use a component instead of styling in place, or" +
      " pay off the debt you added. If you lowered a count, run `npm run metrics:update` and commit metrics.json." +
      " See docs/architecture.md#the-ratchet."
  );
  process.exit(1);
}

