# Running the demo on Lightning

The plan for running this app on a real Lightning: at `/v3` of the
lightning-full-api deployment, on that Lightning's API, and nowhere else.
Everywhere else (`npm run dev`, Storybook, tests, the GitHub Pages build) it
keeps answering from the fake server.

## What we're after

1. The API's contract is openfn-3-poc's [`api/`](https://github.com/OpenFn/openfn-3-poc/tree/main/api).
2. Lightning's `full-api-test` branch implements it.
3. [brandonjackson/lightning-full-api](https://github.com/brandonjackson/lightning-full-api)
   puts that Lightning and this app together and deploys them: Lightning at
   the root, this app at `/v3`.
4. This app uses that Lightning's API when, and only when, it's served there.
   Which source it uses is decided in one place, apart from every page and
   component, so switching is one line. To start, wire only what's obvious,
   and change only the connection point.
5. Over time this app grows to do everything Lightning does, built to a high
   standard, entirely on the API.

## Where it stands

Most of the plumbing for 1 to 3 is done.

- **The fork deploys.** `lightning-full-api`'s `FORK.md` has it. Every six
  hours (and on a push to its `main`), `demo/sync.sh` rebuilds from
  `full-api-test`, builds this repo's `main` with `npm run build -- --base=/v3/`
  into `priv/demo_frontend`, boots the image, smoke-tests it, and only then
  pushes `deploy`, which Railway runs. `LightningWeb.Plugs.DemoFrontend`
  serves the build at `/v3`.
- **This app has one door to the API.** Every request goes through `send` in
  `src/api/client.ts`, which today is `fakeFetch`. Hooks, wrappers, pages and
  components never see where an answer came from.
- **The fake server already speaks Lightning.** Of the fake's 100 routes
  outside `/api/demo/`, Lightning answers 99 at the same path and method. The
  one it doesn't, `GET /api/projects/:project_id/dataclips`, is Planned in
  `api/dataclips.md`. The other 33 routes are the demo's own, under
  `/api/demo/` (connected systems, organisation, handbook, services,
  components, maintenance, reset), which Lightning answers 404.
- **Signing in comes free.** Lightning's API takes the browser's session
  cookie on a request from its own pages (`Sec-Fetch-Site: same-origin`, in
  `LightningWeb.SessionToken`), and a write carries the CSRF token from
  `GET /api/session`, which `client.ts` already asks for. `/v3` is the same
  origin, so anyone signed in to Lightning is signed in here.
- **But most wrappers still read fixtures.** `npm run convergence` says 20 of
  25 wrappers do: they find a project's services, components and sandboxes,
  and a workflow's runs, by `fixtureProject(id)` and `fixtureWorkflow(id)`.
  Against Lightning those ids are Lightning's, so those lookups find nothing.

## The seam

**One switch, set when the app is built.** `VITE_API_SOURCE=lightning` turns
it on; anything else, or nothing, is the fake. Only the fork's build sets it.

*Since 8 Nov 2026:* the build says whether Lightning can be reached
(`lightningAvailable`), and on that build the demo settings' Data tab chooses
between Lightning (the default) and the fixtures, at runtime, remembered in
the browser (`chooseApiSource`, then a reload). Every other build only has the
fixtures. `apiSource` is still fixed for a page load, so nothing below
changes: it's read once, before the first request.

Why at build time and not by sniffing at runtime: the Lightning build is made
in exactly one place (`demo/sync.sh`), so it can say what it is rather than
the app guessing from its URL or probing for a server. Tests, Storybook, dev
and Pages need no change, and there's no moment at startup where the app
doesn't yet know where its data is.

**One file holds it.** A new `src/api/source.ts`:

- exports `apiSource` (`"fake"` or `"lightning"`), read from
  `import.meta.env.VITE_API_SOURCE`;
- exports `send`, with `fetch`'s arguments, which picks per request:
  - fake: everything goes to `fakeFetch`, as now;
  - lightning: `/api/demo/…` goes to `fakeFetch`, everything else to `fetch`.

`client.ts` imports `send` from there instead of `fakeFetch`, and
`source.ts` becomes the one file that imports `src/fake-api/`. Nothing under
`src/pages/` or `src/components/` changes. Going all the way real later is
deleting the `/api/demo/` branch of `send` and then the fake folder.

**What "only the obvious" turns out to mean.** It's tempting to move one area
at a time (projects first, then workflows…), but the data hangs off the
project: once projects come from Lightning, a workflow list from the fake
would be asked for a project id it has never seen and come back empty. So
the obvious line is the API itself: **what Lightning's API has goes to
Lightning, what it doesn't stays on the fake.** It's one rule, it lives in
one function, and it moves by itself as Lightning grows.

## Phase 1: switch it on

Built, and walked page by page on a local Lightning. What's left is shipping
it: merging this repo's change, then the fork's (its sync builds this repo's
`main`, so the order doesn't matter: the new build flag does nothing until
`.env.lightning` is on `main`).

1. **The switch.** Done. `src/api/source.ts` (`apiSource`, `send`,
   `sendFor`); `client.ts` sends through it; `VITE_API_SOURCE` is typed in
   `src/vite-env.d.ts` and set by `.env.lightning`, so `--mode lightning` is
   the whole of it. Lint now lets only `source.ts` import `src/fake-api/`.
2. **The demo routes beside a real session.** Done.
   `fakeFetchBesideLightning` answers `/api/demo/` without its own CSRF
   check, since the session and its token are Lightning's. It also takes
   Lightning's word for projects: a project a demo route is asked about that
   the fake has never seen is one Lightning listed, so it's added, empty,
   with you as its owner. That's what keeps a project's Components and
   Services pages working on Lightning's projects, starting empty.
3. **Signing in.** Done. `src/app/SignedIn.tsx` asks `GET /api/session`
   once; unless it says `signed_in`, the browser goes to the fork's
   `/v3/sign_in?to=<screen>`, which remembers the screen in Lightning's
   session (`:user_return_to`) and sends it on to `/users/log_in`. Signing
   in (MFA and single sign-on included) comes back to that screen. The fork's
   `/v3` plug moved to just after `Plug.Session` so it can write the session.
4. **Reset.** Done. "Reset demo data" is left out on Lightning.
5. **The fork builds with the switch on.** Done, on the fork's branch:
   `demo/sync.sh` builds with `--mode lightning`; `smoke-test.sh` checks
   `/v3/sign_in` redirects, signs in through `POST /api/session` and reads
   `GET /api/projects`; `FORK.md` updated.
6. **Running it locally against Lightning.** Done. `npm run dev:lightning`
   serves the app at `localhost:5173/v3/` and sends everything else to the
   Lightning on port 4000, so `localhost:5173` behaves like the deployment,
   signing in included.
7. **Walk every page.** Done; below. One thing broke and was fixed at the
   seam: Projects listed nothing, because it kept only projects with a
   `role`, which Lightning doesn't send yet. A project with no role is now
   one you're in (`isOpenable`), as Lightning only lists those; `null` still
   means you're not a member. The rest is in api-gaps.md's "Planned in api/,
   not yet in Lightning".
8. **Walk again, once every lane had merged.** Done (8 Nov 2026, at `main`
   2784209, on lightning-full-api dfb883c). Three pages break, all for one
   reason: Lightning's work orders come without their runs or their
   workflow, both still Planned in `api/` (api-gaps.md). Overview, which is
   home, and Insights (the project's and everyone's) stop with a blank screen
   when they add up runs that aren't there, and History lists none of
   Lightning's work orders, since it can't tell which workflow each belongs
   to. The fix belongs at the seam or in Lightning, not in a page; nothing
   was changed in this walk. Since then the seam reads a work order without
   `runs` as having none, so Overview and Insights draw, with zero runs.

### Page by page

Walked on 8 Nov 2026 on a local Lightning (lightning-full-api at dfb883c)
seeded as the deployment seeds it (`DemoSeed`: two projects, one workflow
each, one failed work order, no channels, collections or sandboxes), with
`npm run dev:lightning`, signed in as the demo user, and as the superuser for
Admin settings. Every row below was opened in a browser on that Lightning.

| Page | On Lightning | Notes |
| ---- | ------------ | ----- |
| The chrome (logo, account menu) | Works | You ("Amy") from `GET /api/me`; the instance named "localhost", by its URL's host, since Lightning sends no name (api-gaps.md). Signed out, `/v3/` sends you to Lightning's sign-in, which comes back to `/v3/`. |
| Projects | Works | Lightning's projects (two for the demo user, one for the superuser). Every row says 0 workflows, 0 members and "No activity yet" until `include=stats`. |
| Overview (home) | Works with gaps | The week's tiles say 0 runs and 0 errors: Lightning's work orders come without `runs` (`include=runs` is Planned), and the seam (`toRecord` in `src/api/work-orders.ts`) reads each as having none. Until that fix it was a blank screen, and `/v3/` with it. |
| Project overview | Works | Lightning's workflow (Off, never run) and zero work orders, failed and runs: Lightning's work order isn't counted, as it comes without its workflow. No published services, from the demo's own routes. |
| Workflows | Works | Lightning's workflow, Off, "Never run", for the same reason. |
| Workflow editor | Works | Draws Lightning's workflow (cron trigger, DHIS2, HTTP), read only on main with "Edit in sandbox", 0 runs on the canvas. `GET …/dataclips` answers 404 as expected (Planned), so no saved inputs. Not tried: editing in a sandbox, running. |
| Create | Works | The project from Lightning; the starter ideas from the demo's own route. |
| Components | Works | "No components yet": Lightning's seed has no channels or collections, and the demo's own kinds start empty. |
| Component (a channel, collection or other kind) | Not walked | Nothing to open: Lightning's seed has none, and this walk made no data. |
| Sandboxes | Works | Only main; Lightning's seed has no sandboxes. Not tried: making one. |
| History (project, all) | Works with gaps | Draws, with filters and tabs, but lists "No work orders yet" though Lightning has one: work orders come without `workflow_id` (Planned), so each is dropped as belonging to no workflow. Channel requests: none. |
| Insights (project, all) | Works with gaps | Zero runs every day, as Overview: no `runs` on Lightning's work orders. Was a blank screen until the seam's fix. |
| Deployments | Placeholder | The page's description only, on any build. |
| Settings | Works with gaps | Setup draws Lightning's project, read only ("You cannot modify this project's basic settings") until `permissions`. `GET …/repo_connection` answers 404 as there's no GitHub connection, and the page still draws. Not opened: the other sections. |
| Services (project) | Placeholder | The page's description and a link to "Service"; the project's services show on its overview. |
| A service's page | Demo data, broken links | The Services catalog links to the fixtures' services, under the fixtures' project ids, which Lightning refuses (403), so each opens Not Found. A Lightning project has no services yet. |
| User settings | Works | Your Lightning account: profile, your credential ("DHIS2 play", linked to dhis2-project) and API tokens (none). |
| A system's page | Demo data | The fixtures' systems from the demo's own routes; an old slug link (`/connected-systems/dhis2`) redirects. |
| Systems | Demo data | The demo's own routes: the systems, the adaptors and suggestions a new one is picked from, the ecosystem map and, with X-Road, the directory. Rewalked after lane 5's #222 merged. |
| Services catalog | Demo data, broken links | Live services, what systems offer and the MCP server from the demo's own routes. Its five services link to the fixtures' projects, which Lightning refuses (403), so each opens Not Found (A service's page, above). Rewalked after lane 5's #223 merged. |
| Handbook, Status, Organization settings | Demo data | The demo's own areas, on `/api/demo/` and the fixtures. |
| Get help now | Placeholder | The page's description only, on any build. |
| Admin settings | Breaks | As the superuser, every tab is Not Found: `GET /api/users` answers 403 (only the service account lists users) and `GET /api/auth_provider` 404 with none set (api-gaps.md). Hidden from the demo user, who isn't a superuser. |

## Which data each deployment shows

*Revised 8 Nov 2026: the two sources never mix.* On Lightning, the fake
server answering the demo's own routes starts empty (`seedEmpty` in
`src/fake-api/db.ts`, under its own localStorage key) instead of from the
fixtures, apart from vocabulary that isn't anyone's records (the starter
ideas, the adaptor catalog and suggestions). So on `/v3` the organisation's
systems, services, handbook and ecosystem map are empty; there's no
organisation (Organization settings is Not Found), Status has no checks, and
the recent projects start empty. A workflow the fixtures don't know has blank
docs. To show the fixtures on the Lightning deployment, pick them in the
demo settings' Data tab. The bullets below are the 7 Nov decision; the second
point of the first one no longer holds.

Decided by Brandon (7 Nov 2026): **each deployment keeps its own data, and
blank is fine.**

- **`/v3` on lightning-full-api** shows Lightning's own demo data, as the
  fork seeds it (`Lightning.SetupUtils`). We don't seed Lightning from our
  fixtures. What Lightning doesn't have shows empty: a project's components
  and services start blank, workflows have no descriptions or members, and
  the counts wait on `include=stats`. That's expected, not a bug to fix.
  The demo's own areas that aren't about a project (organisation, handbook,
  systems, the services catalog, Overview's and Insights' instance-wide
  numbers) have nothing in Lightning to show, so they still show the
  fixtures, from the fake server in each browser.
- **Every other build** (the GitHub Pages deployment, `npm run dev`,
  Storybook, tests) keeps the fixtures we've been using, on the fake server.
  That's the default: only `--mode lightning` changes it, and only the fork's
  build and `npm run dev:lightning` pass it. A test (`src/api/source.test.ts`)
  checks that a plain build answers from the fake.

So the fixtures stay the demo's showcase, and `/v3` shows how far the app has
got on the real API. Seeding Lightning from the fixtures (each fixture record
already has a stable UUID, `seedId` in `src/fixtures/ids.ts`, and
`POST /api/provision` could load them) stays possible if a richer `/v3` is
wanted later.

## Phase 3 onwards: converge

Point 5, over time. Most of it is already the plan in
[convergence.md](./convergence.md) and [api-gaps.md](./api-gaps.md); this
work gives it a finish line you can see at `/v3`.

- **Pages onto the API.** Each page moves to its own folder with a
  `.query.tsx` wrapper that reads no fixtures. `npm run convergence` counts it
  down; at zero, every page is on the API and runs on Lightning as it is.
- **Demo areas into Lightning.** As `api/` and `full-api-test` take on an
  area now under `/api/demo/` (api-gaps.md lists them), its hooks move to the
  real paths and its fake routes go. `send` needs no change. When
  `/api/demo/` is empty, the Lightning build no longer needs the fake at all.
- **Keep the fake honest.** A check in the fork's sync that runs requests the
  fake answers against the freshly booted Lightning and compares the shapes,
  so a drift between the two shows up as a failed sync, not a broken page.
- **Lightning's functionality.** Pages Lightning has that this app doesn't
  yet get built here, on the API, to the standards in `CLAUDE.md`, using
  openfn-3-poc's replicas and annotations for what each one does.

The end state: the fake server is only for tests, Storybook and the Pages
build; `/v3` is the whole of Lightning on its API.

## Open questions

1. **Signing in:** Phase 1 sends people to Lightning's sign-in page and back,
   the choice that was cheapest to undo. Build our own on `POST /api/session`
   soon, or keep Lightning's?
2. **What the fork builds:** it builds this repo's `main`, so every merged PR
   is at `/v3` within about six hours. Keep that, or build from a release
   branch once people other than us are looking at it?
3. **Admin settings on Lightning:** the API lets only the service account
   read and change users. Ask for the user routes to take a superuser's
   session, or leave Admin settings to Lightning's own pages until then?
