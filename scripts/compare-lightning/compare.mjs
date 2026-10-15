#!/usr/bin/env node
// Compare the replica with a running Lightning, page by page.
//
//   node scripts/compare-lightning/compare.mjs --spec scripts/compare-lightning/specs/core.json \
//     --var LP=<lightning project id> --var LW=<lightning workflow id> ...
//
// For each shot in the spec it opens the same screen in both apps at the same
// size, runs the same (or per-side) click steps, and writes to --out:
//
//   <name>-lightning.png, <name>-replica.png   the two screenshots
//   <name>.png                                  both side by side (Lightning left)
//   report.md                                   per shot: final URLs, failed steps,
//                                               and the wording only one side has
//
// The wording diff collects headings, column headers, buttons, labels, links,
// menu items, tabs and toasts from each page and lists what's missing on either
// side. Visual differences are expected (the replica harmonises the design
// system); the wording diff is where behaviour and content differences show up.
//
// Options:
//   --spec FILE        JSON list of shots (format below). Required.
//   --out DIR          default ./compare-out
//   --lightning URL    default http://localhost:4000
//   --replica URL      default http://localhost:5173/openfn-ia-demo/#  (HashRouter)
//   --email EMAIL      Lightning login, default demo@openfn.org
//   --password PASS    default welcome12345 (the demo seed's password)
//   --var KEY=VALUE    replaces {{KEY}} anywhere in the spec; repeatable
//   --only a,b         only run the named shots
//
// ignore.json (next to this script) lists wording to leave out of the diff,
// grouped with the reason. Keep it short: only text that differs on every
// page for a known, accepted reason.
//   --width/--height   default 1440x900
//
// Spec format: a JSON array of shots.
//
//   { "name": "editor-job",                      // file name; required
//     "path": "/projects/{{RP}}/w/wf-openhie",   // replica path (after the #)
//     "lpath": "/projects/{{LP}}/w/{{LW}}",      // Lightning path; defaults to path
//     "steps": [...],                            // run on both sides
//     "lsteps": [...], "rsteps": [...],          // or per side (override steps)
//     "lwait": 3000 }                            // ms to let Lightning settle (LiveView)
//
// Steps, run in order; each waits `sleep` ms after (default 700):
//   { "click": "<selector>" }        forced click (overlays don't block it)
//   { "fill": ["<selector>", "text"] }
//   { "press": "Enter" }
//   { "hover": "<selector>" }
//   { "wait": "<selector>" }         wait until it appears
//   { "mouse": [x, y] }              real mouse click at viewport coordinates;
//                                    needed for canvas nodes (React Flow ignores
//                                    synthetic clicks on labels)
//   { "wheel": 800 }                 scroll the page body (content scrolls in a
//                                    container, so full-page shots don't work)
//
// Playwright comes from the repo's devDependencies (playwright-core). The
// browser is CHROMIUM_PATH, defaulting to the cloud container's
// /opt/pw-browsers/chromium, so nothing is downloaded.

import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const opts = {
  out: "compare-out",
  lightning: "http://localhost:4000",
  replica: "http://localhost:5173/openfn-ia-demo/#",
  email: "demo@openfn.org",
  password: "welcome12345",
  width: 1440,
  height: 900,
  vars: {},
  only: null,
  spec: null,
};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const key = argv[i].replace(/^--/, "");
  const val = argv[++i];
  if (key === "var") {
    const [k, ...v] = val.split("=");
    opts.vars[k] = v.join("=");
  } else if (key === "only") opts.only = new Set(val.split(","));
  else if (key === "width" || key === "height") opts[key] = Number(val);
  else if (key in opts) opts[key] = val;
  else throw new Error(`Unknown option --${key}`);
}
if (!opts.spec) throw new Error("--spec is required");

let raw = readFileSync(opts.spec, "utf8");
raw = raw.replace(/\{\{(\w+)\}\}/g, (m, k) => {
  if (!(k in opts.vars)) throw new Error(`Spec uses {{${k}}} but no --var ${k}=... was given`);
  return opts.vars[k];
});
const spec = JSON.parse(raw).filter((s) => !opts.only || opts.only.has(s.name));
mkdirSync(opts.out, { recursive: true });

// Wording that differs on every page for a known reason (ignore.json says why).
const ignored = new Set(
  JSON.parse(readFileSync(new URL("./ignore.json", import.meta.url), "utf8")).flatMap((g) => g.text)
);

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium" });
const viewport = { width: opts.width, height: opts.height };

const L = await browser.newPage({ viewport });
await L.goto(opts.lightning + "/users/log_in");
await L.fill('input[name="user[email]"]', opts.email);
await L.fill('input[name="user[password]"]', opts.password);
await Promise.all([L.waitForNavigation(), L.click("button[type=submit]")]);
if (L.url().includes("/users/log_in")) throw new Error(`Lightning login failed for ${opts.email}`);

async function runSteps(page, steps, tag, failures) {
  for (const s of steps || []) {
    try {
      if (s.click) await page.click(s.click, { timeout: 5000, force: true });
      if (s.fill) await page.fill(s.fill[0], s.fill[1], { timeout: 5000 });
      if (s.mouse) await page.mouse.click(s.mouse[0], s.mouse[1]);
      if (s.wheel) {
        await page.mouse.move(opts.width * 0.6, opts.height * 0.55);
        await page.mouse.wheel(0, s.wheel);
      }
      if (s.press) await page.keyboard.press(s.press);
      if (s.hover) await page.hover(s.hover, { timeout: 5000 });
      if (s.wait) await page.waitForSelector(s.wait, { timeout: 8000 });
      await page.waitForTimeout(s.sleep ?? 700);
    } catch (e) {
      failures.push(`${tag}: ${JSON.stringify(s)} (${e.message.split("\n")[0]})`);
    }
  }
}

// The wording a person reads: headings, headers, controls, menus, toasts.
// Skips the demo's own tooling (settings button, annotations panel) and the
// dev overlays Lightning adds locally.
async function wording(page) {
  return page.evaluate(() => {
    const sel = [
      "h1", "h2", "h3", "h4", "th", "button", "label", "a", "legend",
      "[role=menuitem]", "[role=tab]", "[role=option]", "[role=status]", "[role=alert]", "[role=dialog] p",
    ].join(",");
    const skip = "#tidewave-toolbar, #debug-button, [data-devtools]";
    const seen = new Set();
    for (const el of document.querySelectorAll(sel)) {
      if (el.closest(skip)) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") continue;
      // Accessible name: visible text, else aria-label (Lightning often names
      // icon buttons with sr-only text, the replica with aria-label).
      const text = ((el.innerText || "").trim() || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
      if (text && text.length <= 120) seen.add(text);
    }
    return [...seen];
  });
}

const report = ["# Lightning vs replica", "", `Lightning: ${opts.lightning} (as ${opts.email})`, `Replica: ${opts.replica}`, ""];

for (const s of spec) {
  const failures = [];
  await L.goto(opts.lightning + (s.lpath || s.path));
  await L.waitForLoadState("networkidle").catch(() => {});
  await L.waitForTimeout(s.lwait ?? 3000);
  await L.addStyleTag({ content: "#tidewave-toolbar,#debug-button{display:none!important}" }).catch(() => {});
  await runSteps(L, s.lsteps || s.steps, "lightning", failures);

  // A fresh page per replica shot: with HashRouter, going to a URL that differs
  // only in its hash doesn't reload, so state from the previous shot would leak.
  const R = await browser.newPage({ viewport });
  R.on("pageerror", (e) => failures.push(`replica page error: ${e.message}`));
  await R.goto(opts.replica + s.path);
  await R.waitForTimeout(1500);
  await runSteps(R, s.rsteps || s.steps, "replica", failures);

  await L.screenshot({ path: path.join(opts.out, `${s.name}-lightning.png`) });
  await R.screenshot({ path: path.join(opts.out, `${s.name}-replica.png`) });

  const [lw, rw] = [await wording(L), await wording(R)];
  // Case-insensitive: the replica uppercases some labels with CSS, which
  // innerText reports, and that's styling rather than wording.
  const key = (t) => t.toLowerCase();
  const [lk, rk] = [new Set(lw.map(key)), new Set(rw.map(key))];
  const onlyL = lw.filter((t) => !rk.has(key(t)) && !ignored.has(t));
  const onlyR = rw.filter((t) => !lk.has(key(t)) && !ignored.has(t));

  report.push(`## ${s.name}`, "", `- Lightning: \`${L.url().replace(opts.lightning, "")}\``, `- Replica: \`${R.url().replace(opts.replica, "")}\``);
  for (const f of failures) report.push(`- ⚠️ ${f}`);
  report.push("", `Only in Lightning (${onlyL.length}): ${onlyL.map((t) => `"${t}"`).join(", ") || "none"}`, "");
  report.push(`Only in replica (${onlyR.length}): ${onlyR.map((t) => `"${t}"`).join(", ") || "none"}`, "");
  console.log(`${s.name}: ${onlyL.length} only-Lightning, ${onlyR.length} only-replica${failures.length ? `, ${failures.length} failed step(s)` : ""}`);
  await R.close();
}

// Stitch each pair side by side (Lightning left, magenta gutter).
const C = await browser.newPage({ viewport: { width: opts.width * 2 + 20, height: opts.height } });
for (const s of spec) {
  const img = (side) => readFileSync(path.join(opts.out, `${s.name}-${side}.png`)).toString("base64");
  await C.setContent(
    `<body style="margin:0;display:flex;align-items:flex-start;gap:20px;background:#f0f">` +
      `<img src="data:image/png;base64,${img("lightning")}"><img src="data:image/png;base64,${img("replica")}"></body>`
  );
  await C.waitForTimeout(150);
  await C.screenshot({ path: path.join(opts.out, `${s.name}.png`), fullPage: true });
}

writeFileSync(path.join(opts.out, "report.md"), report.join("\n") + "\n");
console.log(`\nWrote ${spec.length} comparison(s) and report.md to ${opts.out}`);
await browser.close();
