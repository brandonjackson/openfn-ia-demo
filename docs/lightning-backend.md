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

### Page by page

On a local Lightning seeded as the deployment seeds it (`DemoSeed`), signed in
as the demo user, and as the superuser for Admin settings.

| Page | On Lightning | Notes |
| ---- | ------------ | ----- |
| Projects | Works | Lightning's projects. Counts are zero and activity empty until `include=stats`. |
| Project overview | Works | Lightning's workflows and work orders; services from the demo's own routes, empty. |
| Workflows | Works | Lightning's workflows; descriptions and members only for fixture workflows. |
| Workflow editor | Works | Draws Lightning's workflow, read only on main as designed. No saved inputs until project dataclips. |
| Components | Works | Workflows from Lightning, other kinds from the demo's own routes, starting empty. |
| Sandboxes | Works | Lightning's sandboxes. |
| History (project, all) | Works | Lightning's work orders and channel requests. |
| Insights (project) | Works | From Lightning's work orders. |
| Settings | Works with gaps | Reads Lightning's settings; read only until `permissions`. |
| Services (project) | Works | From the demo's own routes, empty. |
| User settings | Works | Your Lightning account. |
| Overview, Insights (all) | Demo data | Still the fixtures' numbers. |
| Handbook, Systems, Services catalog, Organization settings | Demo data | The demo's own areas, on `/api/demo/`. |
| Admin settings | Breaks | Lightning lets only the service account list users (api-gaps.md). Hidden from the demo user, who isn't a superuser. |

## Phase 2: make the two sets of data agree

After Phase 1 the pages on the API show Lightning's data, but the parts still
read from fixtures, and the `/api/demo/` areas keyed by project (components,
services), will be empty for Lightning's projects. Two ways to close that:

- **A. Seed Lightning from our fixtures** (recommended). The fake server
  already gives every fixture record a stable UUID (`seedId` in
  `src/fixtures/ids.ts`). If the fork's seed (`lib/lightning/demo_seed.ex`)
  makes the same users, projects and workflows at those same ids, then
  fixture lookups, the demo routes and Lightning all agree, and the deployed
  demo looks like the one people already know. One way: a script here writes
  the fake's seed out as provisioning documents (`POST /api/provision`,
  `api/provisioning.md`), which the fork commits and its seed applies on an
  empty database.
- **B. Let it be empty.** Leave Lightning's own demo data, and let the
  fixture-fed parts show their empty states until each page moves to the API.
  Less work, but the redesign's richest screens (services, components, the
  ecosystem) would look bare at `/v3`.

A keeps the demo convincing while Phase 3 catches up; B is simpler but
leaves those screens empty. Brandon's call.

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

1. **Seeding (Phase 2):** A or B?
2. **Signing in:** Phase 1 sends people to Lightning's sign-in page and back,
   the choice that was cheapest to undo. Build our own on `POST /api/session`
   soon, or keep Lightning's?
3. **What the fork builds:** it builds this repo's `main`, so every merged PR
   is at `/v3` within about six hours. Keep that, or build from a release
   branch once people other than us are looking at it?
4. **Admin settings on Lightning:** the API lets only the service account
   read and change users. Ask for the user routes to take a superuser's
   session, or leave Admin settings to Lightning's own pages until then?
