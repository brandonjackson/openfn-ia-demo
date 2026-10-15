---
name: compare-with-lightning
description: Compare the replica with Lightning side by side, screen by screen, and fix the differences that matter. Use when asked to check the replica against Lightning, find what's missing or wrong, verify a page matches, or "make it as close as possible" to Lightning.
---

# Compare the replica with Lightning

The goal is to find **behaviour and content** differences: wrong or missing
labels, columns, buttons, empty states, menus, toasts, and actions that do
something different. Visual differences are expected, because the replica
harmonises Lightning's styling into one design system (see CLAUDE.md,
"Matching Lightning"). Only chase a visual difference when it's a big layout
mistake, such as a panel in the wrong place or something missing.

## 1. Run Lightning `main` locally, not demo.openfn.org

demo.openfn.org runs an older release. The replica follows Lightning `main`
(the commit in `annotations/SOURCE.md`), so compare against that. Load the
`lightning-screenshots` skill and run its `setup.sh` (the path is the skill's
base directory, shown when it loads) from a Lightning checkout on `main`. It
installs the toolchain, seeds the same data as the demo and starts the server
on :4000:

```bash
cd <lightning checkout>
<lightning-screenshots skill dir>/setup.sh
```

The first run takes about 10 minutes, then seconds. Users: `demo@openfn.org`
(Amy Admin), `editor@`, `viewer@`, `super@` (superuser), all with password
`welcome12345`. `openhie-project` has the same id in the seed and in
`src/mock-data/`.

Then start the replica: `npm run dev` (port 5173).

Load the shared projects too, so both apps hold the same data (see
`kickstart/README.md`):

```bash
npm run kickstart:sync                     # in this repo
mix lightning.kickstart <this repo>/kickstart/scenario.yaml   # in Lightning
```

Kickstarted projects have the same ids in both apps, so their specs need no
per-side paths. Until Lightning fixes the `z.uuidv4()` check described in
`kickstart/README.md`, patch it locally or its editor won't load them.

If OpenHIE Workflow has no successful run yet, open it in Lightning and click
Run once. The run specs need one.

## 2. Run the comparison script

```bash
npm run compare -- --spec scripts/compare-lightning/specs/core.json \
  --out compare-out $(scripts/compare-lightning/lightning-vars.sh)

# projects loaded from kickstart/exports/ (same ids on both sides)
npm run compare -- --spec scripts/compare-lightning/specs/kickstart.json --out compare-out

# admin pages, as the superuser
npm run compare -- --spec scripts/compare-lightning/specs/admin.json \
  --out compare-out --email super@openfn.org
```

For each shot it writes `<name>.png` (Lightning left, replica right) and a
`report.md` listing, per shot, the wording only one side has. The header of
`scripts/compare-lightning/compare.mjs` documents the spec format: paths per
side, click/fill/mouse/scroll steps, and `{{VAR}}` substitution. Add shots to
a spec rather than writing one-off scripts.

Write output somewhere uncommitted (`compare-out/` is gitignored), or to the
scratchpad if you're in a cloud session.

## 3. Read the results

Start with `report.md`, then **open every side-by-side PNG and look at it.**
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
