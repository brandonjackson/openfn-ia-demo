---
name: compare-with-lightning
description: Compare the replica with Lightning side by side, screen by screen, and fix the differences that matter. Use whenever asked to "compare with Lightning", check the replica against Lightning, find what's missing or wrong, verify a page matches, load a project export into both apps, or make the replica "as close as possible" to Lightning. One command (`npm run compare:all`) sets up Lightning, the shared data and the replica, then runs every spec.
---

# Compare the replica with Lightning

The goal is to find **behaviour and content** differences: wrong or missing
labels, columns, buttons, empty states, menus, toasts, and actions that do
something different. Visual differences are expected, because the replica
harmonises Lightning's styling into one design system (see CLAUDE.md,
"Matching Lightning"). Only chase a visual difference when it's a big layout
mistake, such as a panel in the wrong place or something missing.

## 1. Run everything with one command

```bash
npm run compare:all
```

That's the whole setup. `scripts/compare-lightning/run-all.sh` does what's
missing and skips what's done:

- finds the Lightning checkout (`LIGHTNING_DIR`, else `../lightning` next to
  this repo) or clones OpenFn/lightning `main` there. Compare against `main`,
  never demo.openfn.org, which runs an older release;
- installs the toolchain, seeds the demo data and starts Lightning on :4000;
- patches Lightning's editor UUID check locally (see `kickstart/README.md`;
  never commit that change in Lightning);
- syncs `kickstart/exports/` and loads it into Lightning, so those projects
  have the same data and ids in both apps;
- starts the replica on :5173;
- runs `specs/core.json` and `specs/kickstart.json` as Amy and
  `specs/admin.json` as the superuser, into `compare-out/<spec>/`.

**The first run in a fresh container takes 10 to 15 minutes** (Erlang,
Elixir, deps, compile); later runs take a few minutes. Run it in the
background and wait for it to finish rather than polling. `--setup` only sets
up; `--only core|kickstart|admin` runs one spec. If a step fails, the script
prints the tail of its log.

If the user gives you a **project export** (a Lightning project YAML), add it
to `kickstart/exports/` first, following `kickstart/README.md` (swap personal
emails for demo users), and add a spec for it like `specs/kickstart.json`.

Demo users: `demo@openfn.org` (Amy Admin), `editor@`, `viewer@`, `super@`
(superuser), all with password `welcome12345`.

## 2. Add to the specs as you go

The header of `scripts/compare-lightning/compare.mjs` documents the spec
format: paths per side, click/fill/mouse/scroll steps, and `{{VAR}}`
substitution. When you check a screen that isn't in a spec yet, add it to
one, so the next run covers it. Don't write one-off scripts.

To rerun a few shots after a fix:
`npm run compare -- --spec scripts/compare-lightning/specs/<spec>.json --out compare-out/<spec> --only shot-a,shot-b`
(core.json also needs `$(scripts/compare-lightning/lightning-vars.sh)`).

## 3. Read the results

Start with each `compare-out/<spec>/report.md`, then **open every side-by-side PNG and look at it.**
Neither one is enough alone. For each difference, decide which kind it is:

- **Fixture data**: outside the Kickstarted projects, the replica's fixtures
  are richer than the seed (more workflows, runs, credentials). Not a bug. The wording diff will be noisy
  here; ignore names, ids, dates and counts.
- **Version or config**: Lightning features that depend on config (AI, GitHub
  sync) or on the user's role. Check the Lightning code before calling it a bug.
- **Harness artifact**: a step that failed (listed in the report), a click
  that hit the wrong spot, or a page that hadn't finished loading. Fix the
  spec and re-run.
- **Real difference**: wording, missing or extra controls, an action that
  behaves differently, raw fixture ids where Lightning shows UUIDs, no toast
  where Lightning shows one. These get fixed.

Before fixing, find the Lightning source of truth (INVENTORY.md gives the
path) and copy its exact wording, including its typos. Fix it with the
design system's primitives, per CLAUDE.md, not by copying Lightning's markup.

Then fix the real differences, rerun the affected shots to confirm, and run
`npm run lint`, `npm run build` and `npm run build-storybook`. Tell the user
what you found in four groups (fixed, Lightning bugs, deliberately left,
not compared) and send them the side-by-side PNGs that show a fix.

## 4. Things that tripped up past runs

- **Canvas nodes need real mouse clicks.** React Flow ignores synthetic clicks
  on labels, so use `{ "mouse": [x, y] }`. The coordinates in `core.json` fit
  OpenHIE Workflow at 1440x900. Panels differ in height between the apps, so a
  coordinate inside a panel may land on different things.
- **The replica uses HashRouter.** The script opens a fresh page per shot,
  because navigating to a URL that differs only in its hash doesn't reload.
- **Content scrolls inside a container**, so full-page screenshots don't work.
  Use `{ "wheel": 800 }` steps.
- **Menu items in Lightning can be "not visible"** to Playwright while open.
  Use `>> visible=true` in the selector.
- **The /projects greeting types itself out**; give it a few seconds.
- **Select canvas nodes by URL where you can** (`?job=<id>`, `?trigger=`,
  `?edge=`, `?panel=settings|code|run|editor`). It's sturdier than mouse
  coordinates and works in both apps.
- **Ids differ outside Kickstarted projects.** Lightning ids are random per seed (`lightning-vars.sh`
  prints them). Replica ids are readable fixture ids, shown through `uuidOf()`
  in `mock-data/history-extra.ts`. Never show a raw fixture id in the UI.

## 5. Improving the comparison (not done yet)

- More of the replica's data in `kickstart/exports/`, so fewer screens
  compare the replica's hand-written fixtures against Lightning's thin seed.
  Runs and history still can't be shared this way.
- Shots driven by `annotations/INVENTORY.md` ids, so coverage is measurable.
- The same specs run as `editor@` and `viewer@`, to catch permission
  differences.
- A frozen clock, so relative dates line up.
