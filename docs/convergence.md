# Convergence with openfn-3-poc: handoff and log

The brief is [convergence-prompt.md](./convergence-prompt.md). This file is
everything a new session needs to carry on: read both, then `git log -5`,
`npm run metrics` and `npm run convergence`, and pick up from **Now**.

openfn-3-poc is cloned read-only beside this repo (`../openfn-3-poc`). Grep
it for the pattern the current item needs; don't reread its docs whole. Its
four reviewers (`react-reviewer`, `architecture-reviewer`,
`design-system-reviewer`, `accessibility-reviewer`) run as subagents: tell
each to review `git diff --cached` in this repo, by this repo's CLAUDE.md,
and to mark what would change the look.

## Now

- **Branch:** `claude/lightning-convergence` (earlier sessions used
  `claude/openfn-convergence-decisions-9bf5gi`,
  `claude/openfn-3-poc-convergence-upt3ey` and
  `claude/intelligent-newton-2pncy4`). Each PR is shipped (merged once
  CI is green) and the branch restarted from `main` before the next: `git
  fetch origin main && git checkout -B <branch> origin/main`.
- **Lightning run (7 Nov 2026, Brandon's brief).** Every wrapper onto the
  API, one page per PR, so each works the same on the fake server and on
  Lightning at `/v3` (lightning-backend.md). Most-seen pages first:
  Workflows (done, PR 15), the project overview (done, PR 16), the
  editor's data (done, PR 17; its demo behaviours stay, api-gaps.md), then the rest `npm run convergence` lists. What the API can't give
  is left out and goes in api-gaps.md. **Not walked on Lightning:** this
  session couldn't run Lightning locally (fetching and running its Elixir
  dependencies was refused by the session's permission check), so each
  page is checked on the fake server only and its row in lightning-backend.md
  says so. A session allowed to run `mix deps.get` should walk them.
- **Parallel lanes (from 7 Nov 2026, overnight).** The remaining wrappers,
  split into five lanes that touch different pages, each run by its own
  session on its own branch (`claude/lane-<n>-<name>`), one page per PR,
  merged once CI is green, each next page started from the fresh `main`.
  Same rules as above: read only from the API, leave out what it lacks and
  add it to api-gaps.md, don't fake it, don't change the default build,
  api/ wins over fixtures and the lightning branch, and never push to
  lightning-full-api.

  | Lane | Pages (wrappers) | Owns |
  | ---- | ---------------- | ---- |
  | 1. Project settings | `ProjectSettingsPage` (into `project-settings/`) | `project-records.query.ts` and `asProject`: remove them once Settings is off them; `Shell.query.tsx` imports `asProject` too, so swap that one call when you remove it |
  | 2. Runs | `HistoryPage`, `InsightsPage` (project and all), `OverviewPage` (all) | `fixtures/history.ts`, `fixtures/insights.ts`, `fixtures/overview.ts` (gone), `model/history.ts`, `model/runs.ts`, `model/insights.ts` |
  | 3. Components | `ProjectComponentsPage`, `ComponentPage` (and `ChannelPage`'s folder) | `component-records.query.ts`, `channel-records.query.ts`, `model/component-types.ts` |
  | 4. Shell and small pages | `Shell.query.tsx` (instance, you, superuser from the API), `PlaceholderPage`, `ProjectCreatePage`, and the Sandboxes page's folder and tests (it already reads no fixtures) | `src/app/` except `PageRoute.tsx` lines other lanes add |
  | 5. Demo areas | `ServicesPage`, `ServicePage`, `SystemsPage`, `SystemPage` (X-Road identity from `GET /api/demo/organization/xroad`) | `flagged.fixtures.ts`, `fixtures/xroad.ts`, `fixtures/connected-systems.ts`, `fixtures/service-catalog.ts`, `model/xroad.ts` |

  The editor is done as far as data goes (PR 17); what it still takes from
  fixtures is the demo's behaviour, listed in api-gaps.md. Don't take it on
  in a lane.

  **Shared files.** Every lane edits `docs/convergence.md`,
  `docs/api-gaps.md`, `docs/lightning-backend.md`, `metrics.json` and
  sometimes `CLAUDE.md`, `src/model/page-data.ts` and
  `src/app/PageRoute.tsx`. To keep merges clean:
  - Just before merging, `git fetch origin main && git rebase origin/main`,
    keep both sides of any conflict in the docs, re-run `npm run
    metrics:update` and `npm run convergence`, and write the counts from
    *that* run. Push (fast-forward, or `--force-with-lease` on your own lane
    branch only after a rebase) and wait for CI again.
  - In Done, add your entry at the end titled with the lane ("Lane 2:
    History reads only the API") and its PR link; don't renumber others'.
    Don't rewrite another lane's row in this table or in lightning-backend.md.
  - Moving a type out of page-data.ts: move only your page's types.
  - A lane that finds it needs a file another lane owns: leave it, note it
    under "Waiting on Brandon" with what and why, and move on.

  **Lightning.** The session that wrote this couldn't run Lightning (the
  permission check refused `mix deps.get`). Try once as the brief says; if
  it's refused, check on the fake server only and say so in the PR and in
  the page's row of lightning-backend.md.

  **When a lane is done** (no wrapper of its own reads fixtures), it writes
  a short summary at the end of its session: what merged, what's left, and
  anything for Brandon.
- **PR in progress:** none. The brief's 10 PRs are done; the work now is
  Brandon's decisions (6 Nov 2026, "Decided by Brandon" below). Decisions
  2, 3, 5 and 6 are done, and 4 on Create project. Next, one PR each:
  1. **Every other submit button enabled** (decision 4), second half:
     project, sandbox, component and editor forms (`InviteCollaboratorsModal`,
     `AddCollaboratorsModal`, `GitHubSyncForm`, `RunInputModal`,
     `WebhookAuthMethodModal`, `SystemFormModal`, `ComponentView`'s
     validity, `EditInSandboxModal`, `CollectionNameModal`,
     `SandboxFormModal`, `AddConnectedSystemFlow`, `PromoteSandboxModal`,
     Project settings' name, `ComponentFormModal`, `CollectionItemModal`,
     and `ConfirmModal`'s `confirmPhrase`). Use `focusFirstProblem`
     (`src/components/primitives/focus-field.ts`) with ids from `useId`;
     say "Enter …" under the field; busy label and `aria-disabled` while it
     runs, checking busy before anything else in the handler. Out of scope,
     on Waiting on Brandon: Save disabled until something changes, chat send
     buttons, and actions off for a reason other than the form (bulk retry,
     merge with nothing to merge, read-only fields).
     Watch for: `InviteCollaboratorsModal` and `AddCollaboratorsModal` lay
     out each person as a row of bare inputs with no `FormField`, so
     there's no "under the field" yet: give each row's inputs their own
     error line (a `FormField` per input changes the row's look, so check it
     against the stories, and put it on Waiting on Brandon if it does).
  2. **The section loading pattern** (decision 1): a page draws its frame at
     once, each section its own loading and error. Projects first, then
     Admin settings' audit trail, User settings' credential types,
     Organization settings' X-Road.
  Then the convergence items: ProjectSettingsPage into its folder; the
  system and service pages reading the X-Road identity from the API;
  WorkflowEditorPage.
- **Moving types:** `python3 scripts/move-types.py <from> <to> Name…` moves
  exported declarations (with their doc comments) and rewrites every import
  under src/. Then `npx tsc -b` and add the target's own imports. It cuts a
  union type short at a comment between its members (`WikiBlock`, PR 10):
  check a moved union is whole.
- **A page whose data is one resource** (Organization settings, Handbook):
  the shape goes in the resource's `model/` file (`OrganizationSettings`,
  `Handbook`), which the fixture and the fake server's seed use too, and the
  page file names it: `export type HandbookPageData = Handbook`.
- **Decide before moving page 2** (from the PR 1 architecture review). Raw
  values, not words, in every summary type (PR 3 did it for projects and
  sandboxes); and:
  - **A page's load status.** openfn-3's pattern 11 gives the page a
    `status` prop it draws itself; here `Loaded` replaces the whole page, so
    a list page's loading and error states can't be shown in stories, and a
    403 on a list reads as Not Found. It changes what shows while loading, so
    it's on Waiting on Brandon. If he agrees, do it on Projects first, then
    copy it.
- **Half-done:** nothing. Pages other than Projects are still flat in
  `src/pages/` and still take their data shapes from page-data.ts.

### How to move a page (from PR 1)

1. `git mv` the page, its wrapper and its story into `src/pages/<name>/`
   (kebab-case, the page's name without "Page"); fix imports and the line in
   `src/app/PageRoute.tsx`.
2. Move the page's `XPageData` out of page-data.ts into the page file; move
   any shape a component shares to its resource's `model/` file. Drop the
   `pageType` field.
3. Take fixtures out of the wrapper: read from the API's hooks; what the API
   lacks is left out and gets a line in `docs/api-gaps.md`. Use
   `pageFrame` from `src/app/page-frame.ts`.
4. Write `XPage.test.tsx` (`renderPage`) and `XPage.query.test.tsx` (fake
   server) as in `src/pages/projects/`.
5. Swap layout `className`s for `Stack`/`Text` only where the spacing is
   identical; anything else goes to Waiting on Brandon.
6. Lint, build, test, `metrics:check`, the four reviewers, `metrics:update`,
   this file.

## Done

Counts are from `npm run metrics` (the ratchet) and `npm run convergence`.

1. **Projects list, the worked example.** The page moved into
   `src/pages/projects/` with its first page and query tests
   (`src/test/renderPage.tsx`, a jsdom Vitest project, `ApiProvider
   retry={false}`). Its wrapper reads no fixtures: service counts come from
   the services API and are left out when the catalog is off or they can't
   load (`useProjectSummaries`, which Overview uses too). `ProjectSummary`
   moved to `model/projects.ts`; `route.fixtures.ts` became
   `src/app/page-frame.ts` with no fixture fallback. Lint holds page tests to
   page rules. Create project's fields are now labelled. Counts:
   classNamesInPages 110 → 107; wrappers reading fixtures 25 → 23 of 25;
   page-data.ts 1322 → 1300 lines; files importing it 140 → 138; pages in
   their own folder 0 → 1 of 24; page and query tests 0 → 2; tests 84 → 96.
   ([#191](https://github.com/brandonjackson/openfn-ia-demo/pull/191))
2. **Shared and UI-only types out of page-data.ts.** `BadgeTone` now lives
   in the `Badge` primitive; `Environment` and `ENVIRONMENTS` in
   `model/credentials.ts` (credentials own environments in api/); the system
   shapes (`SystemChanges`, `SystemEnvironment`, `ConnectedSystemSummary`,
   `SuggestedSystem`) in `model/connected-systems.ts`; `ProjectServiceItem`
   and its API spec types in a new `model/services.ts`; `ProjectRole` is
   imported from `model/project-settings.ts`, not re-exported. Adds
   `scripts/move-types.py`. No runtime change, so only the architecture reviewer
   ran. Counts: page-data.ts 1300 → 1199 lines;
   files importing it 138 → 127; ratchet unchanged.
   ([#192](https://github.com/brandonjackson/openfn-ia-demo/pull/192))
3. **Times as the API sends them.** A project card's and a sandbox's last
   activity reach their components as the API's timestamp (or null), and
   `ProjectCard` and the Sandboxes page word it with `timeAgo`, instead of
   branching on the word "Never". Fixtures keep their words ("3 days ago"):
   the fake server seeds from `projectSandboxRecords`, and `msAgo`/`isoAgo`
   in `model/time.ts` read them for the fake server and the stories alike.
   Counts: tests 96 → 105; the rest unchanged.
   ([#193](https://github.com/brandonjackson/openfn-ia-demo/pull/193))
4. **Credential and account types out of page-data.ts.** The credential
   shapes (`UserCredential`, `CredentialSchema`, `CredentialField`,
   `OAuthClient`, their drafts, `ProjectOption`) join their helpers in
   `model/credentials.ts`; your account's (`UserProfile`, `MfaSetup`,
   `BackupCode`, `ApiToken`, contact preferences) and the password and TOTP
   rules move to a new `model/account.ts`, named as in `api/account.md`. No
   runtime change. Counts: page-data.ts 1200 → 1054 lines; files importing
   it 127 → 113.
   ([#194](https://github.com/brandonjackson/openfn-ia-demo/pull/194))
5. **Admin settings into its folder.** `src/pages/admin-settings/` with its
   first page and query tests (accounts: list, create, a refusal). Its types
   left page-data.ts for files named as in api/: `model/users.ts`,
   `model/audit-events.ts`, `model/authentication.ts` (the sign-on
   provider), `model/collections.ts` (with the project collection types),
   `AdminProject` into `model/projects.ts`, `MaintenanceTask` into
   `model/admin.ts`; `AdminSettingsPageData` sits in the page file. Pulled
   openfn-3-poc first: no change since PR 1 (still `a3e3d02`). Counts:
   page-data.ts 1054 → 837 lines; files importing it 113 → 91; pages in
   their own folder 1 → 2 of 24; page and query tests 2 → 4; tests 105 →
   112. ([#195](https://github.com/brandonjackson/openfn-ia-demo/pull/195))
6. **Admin settings off fixtures.** Its wrapper only calls hooks now: you
   from `useMe`, the instance from `GET /api/instance` (`useInstance`: URL,
   deletion grace period, and the demo's `usage_metrics_enabled`), the
   maintenance jobs from `/api/demo/maintenance` (`src/api/maintenance.ts`),
   and testing a sign-on provider from `/api/demo/auth_provider/test`, whose
   answer comes back as the action's reply (the page keeps it as UI state;
   a URL with no configuration is refused as saving refuses it, and any other
   refusal shows in the same "Test failed" callout).
   Maintenance runs record an ISO time, which `MaintenanceTaskCard` words.
   Three api-gaps entries. Counts: wrappers reading fixtures 23 → 22 of 25;
   tests 112 → 119. ([#196](https://github.com/brandonjackson/openfn-ia-demo/pull/196))

7. **Admin settings' audit trail paged by the server.** `useAuditTrail`
   takes the query and asks `GET /api/audit_events` for one page, filtered
   by `event` and `item_type`; `listPage` (`src/api/client.ts`) reads the
   total from the last page, since the list sends no `meta`. The filters and
   page live in the URL (`?q=&event=&item_type=&page=`), so Back steps
   through them; a page past the end shows the last. Text search isn't in
   api/, so only a search reads the whole filtered trail. The event filter
   offers a fixed list of Lightning's event names (`auditEventNames`)
   instead of the names found in the trail. Two api-gaps entries (one
   rewritten). An unknown `?event=` or `?item_type=` is dropped. Counts:
   ratchet unchanged; tests 119 → 128.
   ([#197](https://github.com/brandonjackson/openfn-ia-demo/pull/197))

8. **User settings into its folder, credential types from the API.**
   `src/pages/user-settings/` with its first page and query tests;
   `UserSettingsPageData` left page-data.ts for the page file (the story
   builds its data from the fixtures' pieces, and `userSettingsData` is
   gone). The type picker reads `GET /api/credential_schemas` and each
   `GET /api/credential_schemas/:name` (`useCredentialSchemas`), which the
   fake server answers as JSON Schema (`src/fake-api/credential-schemas.ts`:
   secrets `writeOnly`, URLs `format: uri`, `required`, `examples`,
   `default`); raw JSON is `rawCredentialSchema` in the model. Credentials
   now store their schema in full (`@openfn/language-dhis2`), as api/ says,
   and `schemaIdOf` reads it back as the form's short name. One api-gaps
   entry. Counts: wrappers reading fixtures 22 → 21 of 25; page-data.ts 833
   → 809 lines; files importing it 91 → 89; pages in their own folder 2 → 3
   of 24; page and query tests 4 → 6; tests 128 → 145.
   ([#198](https://github.com/brandonjackson/openfn-ia-demo/pull/198))

9. **Organization settings into its folder, X-Road identity from the API.**
   `src/pages/organization-settings/` with its first page and query tests.
   The organisation's types left page-data.ts for `model/organization.ts`
   (`OrganizationMember`, `BillingDetails`, `ContextLayer`,
   `VisibilityScope`, `organizationRoles`, `OrganizationInvite`, and
   `OrganizationSettings`, which the fixture, the fake server's seed and the
   page share; the page's `OrganizationSettingsPageData` names it). The
   organisation's X-Road identity is read from a new read-only
   `GET /api/demo/organization/xroad` (`useOrganizationXRoad`, loaded only
   with X-Road on), seeded once, with UUIDs, and certificate expiry and a
   Security Server's last contact sent as timestamps. The wrapper reads no fixtures. Counts:
   wrappers reading fixtures 21 → 20 of 25; page-data.ts 809 → 746 lines;
   files importing it 89 → 83; pages in their own folder 3 → 4 of 24; page
   and query tests 6 → 8; tests 145 → 156.
   ([#199](https://github.com/brandonjackson/openfn-ia-demo/pull/199))

10. **Handbook into its folder.** `src/pages/handbook/` with its first page
    and query tests (reading, saving the article, a heading used twice
    refused with the server's reason, adding and removing a file, a load
    failure). The API hook's article type is now `HandbookArticle`, so it
    isn't confused with the model's `Handbook`. The handbook's types left page-data.ts for
    `model/handbook.ts`, with `Handbook`, the shape the fixture and the page
    share. Pulled openfn-3-poc first: no change since PR 1 (still
    `a3e3d02`). Counts: page-data.ts 746 → 702 lines; files importing it
    83 → 78; pages in their own folder 4 → 5 of 24; page and query tests 8
    → 10; tests 157 → 168.
    ([#200](https://github.com/brandonjackson/openfn-ia-demo/pull/200))

11. **Brandon's decisions recorded; design-system tidy-ups (decision 6) and
    Create project's button (decision 4, first form).** `Modal` traps focus:
    it moves in on open, Tab wraps, Escape closes, and focus goes back to the
    opener (read while rendering, before a field can autofocus). Create
    project is a `Modal` titled "Create project", its button always enabled,
    saying "Enter a project name" under the field (and focusing it) when
    pressed without one, `aria-disabled` while it creates, and focusing the
    field a refusal names. `FormField` now ties its hint or error to its
    control (`aria-describedby`, `aria-invalid`, `aria-required`) and draws
    hints at gray-500; `Text` takes `role="status"`, which the Projects count
    uses. Projects search is `SearchInput`,
    the list sits at 16px, and the count and "No description" are gray-500.
    CLAUDE.md now says no form disables its submit button to say it isn't
    ready. Counts: classNamesInDomain 707 → 699; classNamesInPages 107 →
    106; tests 168 → 170.
    ([#201](https://github.com/brandonjackson/openfn-ia-demo/pull/201))

12. **The audit trail leads with the item** (decision 3). The Item column
    comes before Event, the item type filter before the event filter, and
    the search reads "Filter by item or actor". The event filter keeps its
    fixed list. ([#202](https://github.com/brandonjackson/openfn-ia-demo/pull/202))

13. **Credential types load when picked** (decision 2). The picker reads
    only `GET /api/credential_schemas` (`CredentialSchemaSummary`: id, name,
    adaptor); a type's JSON Schema is fetched when "Configure credential" is
    pressed, or as a credential opens for editing, through the page's
    `onLoadCredentialSchema` (`useCredentialSchemaLoader`: a stable
    `fetchQuery`, kept for the session). The button says "Loading…" and is
    `aria-disabled` meanwhile; a refusal shows in an alert callout and the
    picker stays; a type clicked mid-load is ignored. The picker's rows lost
    their description line and its search matches names only. Also:
    `Callout` takes `role="alert"`, a `ListRow` with `selected` and
    `onClick` is a toggle button (`aria-pressed`), the credential form
    focuses its Name field when it opens on a type, and its Save is
    `aria-disabled` while saving. Counts: tests 170 → 176; the rest
    unchanged.

14. **Submit buttons enabled on account, credential, admin and
    organisation forms** (decision 4, first half). `UserFormModal`,
    `ProjectFormModal`, `InviteOrgMemberModal`, `DeleteAccountModal`,
    `TransferCredentialModal`, `AuthProviderForm` (Save and Test),
    `ProfileDetailsForm`'s validity, the credential picker's "Configure
    credential" and Organization settings' context layer URL stay enabled:
    pressed with something missing, each says so under the field ("Enter a
    first name", "Enter a project name", "Enter a context layer URL"; the
    picker's "Choose a credential type") and focuses it, sending nothing.
    Those and `OAuthClientModal`, `ChangeEmailForm`, `ChangePasswordForm`,
    `MfaSetupFlow`, the credential form's Save, Handbook's Save and
    Organization settings' Saves are `aria-disabled` with a busy label while
    they run, and ignore a second press. A new primitive helper,
    `focusFirstProblem` (`focus-field.ts`), which `CreateProjectFlow` uses
    too; `ListRow` takes an `id`; the credential form, saved with a field
    wrong on another environment, switches to it and focuses the field; the
    owner problem in `ProjectFormModal` is a fresh alert on each press;
    AuthProviderForm's errors use `FormField`'s `error`; the context layer
    form is `noValidate`. Counts: tests 176 → 183; the rest unchanged.

15. **Workflows reads only the API** (Lightning run). The page moved to
    `src/pages/project-workflows/` with its page and query tests. Its rows
    come from `asListItem` in a new `model/workflow-list.ts` (with
    `WorkflowListItem`, `byWorkflow` and `LIST_PERIOD`, which Overview uses
    too): the workflow and its work orders from the API, and the service
    badge from the services routes (`useProjectServices` takes `enabled`;
    left out if they fail to load). Descriptions and members aren't in
    api/, so the rows leave them out on every build and `WorkflowRow` drops
    its Members column (api-gaps.md; this changes the look of the Pages
    build). New workflow passes the project's id. A refused toggle or delete
    now says why in an alert callout, and Delete says "Deleting…" while it
    runs. Counts: wrappers reading fixtures 20 → 19 of 25; page-data.ts
    702 → 673 lines; files importing it 78 → 74; pages in their own folder
    5 → 6 of 24; page and query tests 10 → 12; the ratchet unchanged.

16. **Project overview reads only the API** (Lightning run). The page moved
    to `src/pages/project/` with its page and query tests, and
    `ProjectPageData` into the page file. Its components are its workflows
    with `useProjectComponents`' list (channels and collections from
    Lightning's API, the other kinds from the demo's), not its fixture's;
    New workflow passes the project's id. `componentsFor` and
    `componentTypesFor` moved to `model/component-types.ts`, and
    `channelEventAddress` to `model/channels.ts`, so the channel and
    component helpers read no fixtures; `convergence-counts.sh` now finds
    the helpers that do by what they import, not by name. Counts: wrappers
    reading fixtures 19 → 16 of 25 (the overview and the two helpers);
    page-data.ts 673 → 658 lines; files importing it 74 → 72; pages in
    their own folder 6 → 7 of 24; page and query tests 12 → 14; the ratchet
    unchanged.

17. **The editor's service and the sandbox selection from the API**
    (Lightning run). "See service listing", the webhook URL and service.md
    come from the services API (the service main's workflow backs), not the
    fixtures' `serviceForWorkflow`; `serviceListing` and a new `serviceUrl`
    moved to `model/services.ts`. The selected sandbox is kept by project id
    in the shell, the editor and the Sandboxes page alike, not by fixture
    slug, which takes the Sandboxes page off the fixtures. First editor
    test, `WorkflowEditorPage.query.test.tsx` (it stubs `ResizeObserver` and
    `scrollTo` for jsdom). The editor still reads fixtures for what isn't
    data: adaptors, the assistant, simulated runs, docs, old slug links and
    "New workflow" from the Services catalog (api-gaps.md, "The editor's
    demo behaviours"). Counts: wrappers reading fixtures 16 → 15 of 25;
    page and query tests 14 → 15; the rest unchanged.

- **Lane 3: Components reads only the API.** The page moved to
  `src/pages/project-components/` with its page and query tests, and
  `ProjectComponentsPageData` into the page file (without `pageType`).
  `ProjectComponentType` and `ProjectComponentItem` left page-data.ts for
  `model/component-types.ts`. The wrapper no longer fetches workflows: the
  page never lists them (they have their own page), and the only fixture it
  read was their descriptions. A viewer is no longer offered New channel
  (the server refused it): channels need `create_channel`, the other kinds
  `create_workflow`. Checked on the fake server only (this
  container has no Elixir). Counts: wrappers reading fixtures 15 → 14 of
  25; page-data.ts 658 → 632 lines; files importing it 72 → 64; pages in
  their own folder 7 → 8 of 24; page and query tests 15 → 17; the ratchet
  unchanged.
  ([#210](https://github.com/brandonjackson/openfn-ia-demo/pull/210))
- **Lane 4: The shell reads only the API.** The chrome takes the instance
  from `GET /api/instance` (`useInstance`) and you and whether you're a
  superuser from `GET /api/me` (`useMe`), not `fixtures/user.ts`. Lightning
  sends no instance name, so the fake server adds `name` ("Sim DTU") and the
  shell names an instance without one by its URL's host, or the page's own
  host if it couldn't be loaded (`instanceName`, `instanceInitials` in
  `model/account.ts`; api-gaps.md). The logo's tile is blank until then; the
  account menu shows once you're loaded (Sidebar's Loading story). Admin
  settings wait (`LoadingState`) until it's known whether you're a
  superuser, instead of saying Not Found first, and show the server's
  reason if you couldn't be loaded. App tests may run on the fake server
  (eslint), as page query tests do. The shell still fills its project with
  `asProject`, which lane 1 removes; the count misses that import. Checked
  on the fake server only: this session has no Elixir to run Lightning.
  Counts: wrappers reading fixtures 14 → 13 of 25; tests 234 → 244;
  the rest unchanged.
  ([#212](https://github.com/brandonjackson/openfn-ia-demo/pull/212))
- **Lane 4: Pages not built yet read only the API.** `PlaceholderPage`
  moved to `src/pages/placeholder/` with its page and query tests. Its
  wrapper no longer reads `fixtures/ids`: an old link naming a connected
  system by the fixture's slug (`/connected-systems/dhis2/…`) is sent on to
  its id by the route (`PageRoute`, beside the projects' redirect, with its
  first tests in `PageRoute.test.tsx`), so every page under a system gets
  it; an id it doesn't know is left as typed, to say Not Found. For lane 5: `SystemPage.query.tsx`'s own slug redirect
  can't be reached now and can go. No look change, so only the architecture
  and React reviewers ran. Checked on the fake server only. Counts: wrappers
  reading fixtures 13 → 12 of 25; pages in their own folder 8 → 9 of 24;
  page and query tests 17 → 19; tests 244 → 255; the rest unchanged.
  ([#214](https://github.com/brandonjackson/openfn-ia-demo/pull/214))
- **Lane 1: Project settings reads only the API.** The page moved to
  `src/pages/project-settings/` with its page and query tests. Its
  Credentials are the ones linked to the project
  (`GET /api/projects/:id/credentials`, each type named by the credential
  schemas), with every environment it has values for; the Access column
  and "Request access" are left out, since the API has no organisation's
  credentials (api-gaps.md; this changes the look). Export project is
  `GET /api/provision/yaml` and downloading an export fetches its
  `download_url`, both through a new `getFile` in `src/api/client.ts`,
  with fake-server routes for each (`src/fake-api/provisioning.ts`, the
  export's download in `history-exports.ts`); each says "Exporting…" or
  "Downloading…" while it runs and why it failed in an alert, and so does
  a refused "Create export". `EnvironmentBadge` shows a name it doesn't
  know in a plain badge. You are `/api/me` (matched by id), not the
  fixture user. A credential list without `environments` (planned scope)
  and credential schemas that won't load no longer stop the page. The
  page's types left page-data.ts for `model/projects.ts`,
  `model/webhooks.ts`, `model/github-sync.ts` and `model/work-orders.ts`
  (each with its enum),
  and its story builds its data from the fixtures' pieces
  (`projectCollaborators`). `src/pages/project-records.query.ts` is gone:
  the shell's `asProject` is in `model/projects.ts` and reads no fixtures
  (the shell never showed a project's services or components), which
  lane 4's note above was waiting on. Not walked
  on Lightning: the session has no Elixir. Counts (after lanes 3 and 4):
  wrappers reading fixtures 12 of 25 → 10 of 24 (Settings and the helper);
  page-data.ts 632 → 460 lines; files importing it 64 → 50; pages in their
  own folder 9 → 10 of 24; page and query tests 19 → 21; the ratchet
  unchanged.
  ([#216](https://github.com/brandonjackson/openfn-ia-demo/pull/216))
- **Lane 2: History reads only the API.** The page moved to
  `src/pages/history/` with its page and query tests, and
  `HistoryPageData` into the page file (`HistoryWorkflowOption` into
  `model/history.ts`). The wrapper imports no fixtures: work orders sort
  with `newestFirst` (`model/history.ts`), and `stampTime`
  (`model/runs.ts`) reads an ISO timestamp as well as the fixtures'
  stamps; a work order's received time is the demo's `received_at` or,
  as Lightning sends it, `inserted_at`. An old History link filtering by
  a project's or workflow's slug (`?project=`, `?workflow=`) is redirected
  in `PageRoute.tsx`, beside the other old-link redirects, and tested
  there. A refused
  retry, retry from a step, cancel or export says why in an alert callout
  and keeps the picks; every notice is read out (a fresh `key` each time,
  success as `status`); a bulk action says "Retrying…" (or "Cancelling…",
  "Exporting…") and is `aria-disabled` while it runs, ignoring a second
  press. Export sends the shown work orders as the list's `id` filter
  (`useHistoryExportSaves` takes the ids), and across projects there's no
  Export, since an export belongs to one project (it used to say "Export
  started." and do nothing). Lightning wasn't walked: this container has
  no Elixir. Counts (after lanes 1, 3 and 4): wrappers reading fixtures
  10 → 9 of 24; page-data.ts 460 → 426 lines; files importing it 50 → 46;
  pages in their own folder 10 → 11 of 24; page and query tests 21 → 23;
  tests 273 → 292; the ratchet unchanged.
  ([#211](https://github.com/brandonjackson/openfn-ia-demo/pull/211))
- **Lane 2: Insights reads only the API.** The page moved to
  `src/pages/insights/` with its page and query tests. Its numbers are
  worked out by `insightsFor` (a new `model/insights.ts`, with `Insights`,
  `DailyRuns` and `ProjectInsight`, which left page-data.ts) from the
  projects' work orders: the last 7 days of finished runs (today and the 6
  days before, whole days), errors, the error rate against the week
  before, and the average run time, for one project or every project you
  can open, with a row each. Both used to be fixed fixture numbers, so the
  default build's week is now the fixtures' few runs, not a busy
  organisation's (the stories keep that one); this also puts Insights
  (all) on Lightning, which lightning-backend.md's 7 Nov decision had left
  on the fixtures because it thought Lightning had nothing to show. A
  project with no runs has no rate ("—", not "NaN%"). Lightning wasn't
  walked (no Elixir here). Counts: wrappers reading fixtures 9 → 8 of 24;
  page-data.ts 426 → 399 lines; files importing it 46 → 45; pages in their
  own folder 11 → 12 of 24; page and query tests 23 → 25; tests 292 → 304;
  the ratchet unchanged.
  ([#218](https://github.com/brandonjackson/openfn-ia-demo/pull/218))

- **Lane 3: A component's page reads only the API.** `ComponentPage`,
  its wrapper and `ChannelPage` moved to `src/pages/component/` with page
  tests for both, a query test, and `ComponentPageData` and
  `ChannelPageData` into their page files (without `pageType`). Old slug
  links (a fixture project's and any of its components, a workflow
  included) are sent on by routing, in `src/app/component-links.ts` with
  its own test, so the wrapper reads no fixtures. A channel's Edit, Turn off and Delete are
  offered only with `update_channel` and `delete_channel` (the server
  refused a viewer's), and a refused toggle or delete, on a channel or any
  other component, now says why in an alert callout, as Workflows does;
  a second Turn off while one saves is ignored, and each component's page
  starts fresh (keyed by its id).
  Checked on the fake server only. Counts (after lanes 1, 2 and 4): wrappers reading
  fixtures 8 → 7 of 24; page-data.ts 399 → 372 lines; files importing it
  45 → 42; pages in their own folder 12 → 14 of 24; page and query tests
  25 → 28; the ratchet unchanged.
  ([#213](https://github.com/brandonjackson/openfn-ia-demo/pull/213))
- **Lane 2: Overview reads the API.** The page moved to
  `src/pages/overview/` with its page and query tests, and its data type
  into the page file as `OverviewPageData` (`fixtures/overview.ts` is gone:
  fixtures can't name a page's shape, so the story builds its data from the
  fixtures' pieces). The week's runs and errors are `weekTiles` over
  `insightsFor` (`model/insights.ts`) for every project you can open, so
  they match Insights; projects and systems were already the API's. Nothing
  in api/ says what isn't running, so the Status tile is left out on every
  build (api-gaps.md; **this changes the look**: two tiles, in two
  columns, not three). The page doesn't wait for the work orders: the tiles
  appear once they're in and are left out if they fail (decision 1's
  section pattern would give them their own loading and error).
  The add-a-system catalog (adaptors and suggested systems) still comes
  from fixtures, marked `debt:`: it's lane 5's (`fixtures/connected-systems.ts`),
  and the Systems page needs the same, so the wrapper still counts as
  reading fixtures until lane 5 moves it. A suggested system you've added
  isn't suggested again. Lightning wasn't walked (no Elixir here). Counts:
  (after lane 3's second PR) wrappers reading fixtures 7 of 24, unchanged
  (the catalog, above); page-data.ts 372 → 353 lines; files importing it
  42 → 41; pages in their own folder 14 → 15 of 24; page and query tests 28
  → 30; tests 326 → 335; the ratchet unchanged.
  ([#219](https://github.com/brandonjackson/openfn-ia-demo/pull/219))
- **Lane 4: Create reads only the API.** `ProjectCreatePage` moved to
  `src/pages/project-create/` with its page and query tests, and
  `ProjectCreatePageData` into the page file (just `ideas`: no `pageType`,
  and the project's id, which the page never used, is gone). The starter
  ideas come from a new demo route, `GET /api/demo/build_ideas`
  (`useBuildIdeas`; seeded from `fixtures/build-ideas.ts`, with a lifecycle
  test), since api/ has no AI building; `BuildIdea` moved to
  `model/build-ideas.ts`. If the ideas can't load, the page says so, as
  every page does until decision 1. Still to do under decision 4:
  `BuildPrompt` disables Build while the box is empty. Checked on the fake
  server only. Counts (after lanes 1, 2 and 3): wrappers reading fixtures 7 → 6 of
  24; page-data.ts 353 → 335 lines; files importing it 41 → 38; pages in
  their own folder 15 → 16 of 24; page and query tests 30 → 32; tests 335
  → 345; the ratchet unchanged.
  ([#217](https://github.com/brandonjackson/openfn-ia-demo/pull/217))
- **Lane 4: Sandboxes into its folder, with tests.** `ProjectSandboxesPage`
  moved to `src/pages/project-sandboxes/` with its first page and query
  tests (it already read no fixtures). `ProjectSandboxesPageData` went into
  the page file (just `sandboxes`), and the sandbox shapes the modals share
  (`SandboxItem`, `SandboxDraft`, `SandboxMerge`, `SandboxChange`,
  `SandboxColor`, `SANDBOX_COLORS`) into `model/sandboxes.ts`. The tests
  found a bug: making or deleting a sandbox changed `useSandboxChanges`'
  key, so the page was swapped for a spinner and lost its "Created a
  sandbox" notice; it now keeps the project's last answer while the new one
  loads (never another project's). A refused delete now says why in an
  alert, as Workflows does, instead of failing silently. Still to do under
  decision 4 (already on its list): `SandboxFormModal` disables Create while
  the name is wrong, and shows no refusal or "Creating…". Checked on the
  fake server only. Counts (after lanes 1, 2 and 3): page-data.ts 335 →
  274 lines; files importing it 38 → 32; pages in their own folder 16 → 17
  of 24; page and query tests 32 → 34; tests 345 → 357; the rest
  unchanged. **Lane 4 is done:** no wrapper of its own reads fixtures.
- **Lane 5: A system's page reads only the API.** The page moved to
  `src/pages/system/` with its page and query tests, and its data to
  `SystemPageData` in the page file (the system, its grants, and its X-Road
  route), which works out Shared or Private from the system's credential
  type instead of being handed the words. Over X-Road, the organisation's
  identity comes from `GET /api/demo/organization/xroad` and the member and
  service the route goes to from a new read-only
  `GET /api/demo/organization/xroad/directory` (`useXRoadDirectory`), so
  `XRoadConnectionDetails` takes `XRoadIdentity` (model/xroad.ts). Its own
  slug redirect is gone: lane 4's route sends old links on. `systemsFor` moved
  to `model/connected-systems.ts` and `pages/flagged.fixtures.ts` is gone;
  `AccessGrant` and `XRoadRouteContext` left page-data.ts. Revoke and
  Delete say "Revoking…"/"Deleting…" while they run (`ConfirmModal` takes
  `busy`, which marks its button `aria-disabled`; Cancel waits), and a
  refusal says why in an alert callout, as Workflows does. If the identity
  or the directory can't load, the system still shows, without its route.
  The grants route now sends JSON:API resources, mapped in
  `useAccessGrants`. Not walked on Lightning. Counts:
  wrappers reading fixtures 6 → 5 of 24; page-data.ts 274 → 235 lines;
  files importing it 32 → 27; pages in their own folder 17 → 18 of 24; page
  and query tests 34 → 36; tests 357 → 372; classNamesInPages 106 → 103.
  ([#215](https://github.com/brandonjackson/openfn-ia-demo/pull/215))

**PRs done: 17** (10 for the brief, then Brandon's decisions, then the Lightning run). Pull openfn-3-poc again at PR 10.

## Decided by Brandon (6 Nov 2026)

Each is a PR (or part of one) on the list below **Now**'s items; tick it off
in Done when it ships.

1. **One loading and error pattern, defined once.** A page draws its frame
   (header, side menu) at once; each section owns its loading and error
   state, so a failure in one section stays in it. Write it once (on
   Projects first), then use it on Admin settings' audit trail, User
   settings' credential types and Organization settings' X-Road section.
   Replaces "Loading state" and the three "whole page" items.
2. **Credential types load when picked.** Load only the schema list for the
   picker; fetch a type's schema once it's picked. Drop the picker's
   description line for now, and ask for `description` on
   `GET /api/credential_schemas` (docs/api-gaps.md).
3. **The audit trail answers "what happened to this thing?"** Item type
   (and a search on the item) lead; the event filter is secondary. Keep its
   fixed list; don't ask api/ for the event names.
4. **No submit button disabled to say a form isn't ready.** Keep it enabled
   and, on submit, say what's missing under the field (WCAG: a disabled
   button can't be focused and doesn't say why). A button stays disabled
   only while its action is running. Written down in CLAUDE.md for every
   form; Create project first, then the rest.
5. **"Last seen" ages with the data.** Accepted; nothing to do.
6. **Design-system tidy-ups, all yes:** `Modal` traps focus and returns it;
   Create project on `Modal` with "Create project" in sentence case;
   Projects search on `SearchInput`; the Projects list at 16px (`Stack
   gap="md"`); quiet text at `muted` (gray-500).

## Waiting on Brandon

Changes that would alter how a screen looks or what it says. Not made; each
says what and why. Everything up to 6 Nov 2026 was decided (above); new:

1. **A credential's fields that won't load when editing** (from PR 13's
   reviewers). The form shows the server's reason where the fields go, but
   offers no "Try again", and Save does nothing while the fields load or
   after they're refused. Would add a "Try again" button in that callout and
   a line under Save ("The credential's fields haven't loaded").
2. **Busy buttons look the same as ready ones.** `Button` styles only
   `disabled`, so an `aria-disabled` button (Create project, the credential
   form) only changes its label ("Loading…", "Creating…"). Screen readers
   don't always re-read a focused button whose label changes. Would add a
   busy look to `Button` (as `disabled:` has) and a visually hidden status
   line, in the primitive, for every busy button at once.
3. **One wording for a missing field** (from PR 14's reviewers). New
   messages say "Enter a first name"; older ones say Lightning's "can't be
   blank" (`ProfileDetailsForm`, `ChangeEmailForm`, `ChangePasswordForm`,
   `OAuthClientModal`, `emailError` in `model/credentials.ts`) or
   "Required." (`authProviderErrors`), and `ProfileDetailsForm` shows its
   errors while you type, not after a press. Would move them all to
   "Enter …", after a press, with one email check in `model/`.
4. **Save disabled until something changes** (`ProfileDetailsForm`,
   Organization settings' visibility and X-Road, Project settings,
   `ComponentView`). Decision 4 says a button is disabled only while it
   runs; enabling these needs something to say when there's nothing to
   save ("No changes to save"), or a save that does nothing.
5. **"Choose a credential type" as a callout** above the picker. The
   picker has no field to put it under; a labelled group of types carrying
   the message would read better but changes the picker's look.
6. **No account menu when you can't be loaded** (lane 4, from its
   reviewers). If `GET /api/me` fails, the sidebar has no account menu, so
   no Log out or Settings, and nothing says why. Would draw a plain "Log
   out" (and the reason) in its place. Admin settings' wait could also say
   "Loading Admin settings…" rather than "Loading…".
7. **Project settings' Credentials** (Lane 1's reviewers). The section's
   sentence still says "Each credential belongs to one environment", but a
   credential from the API can have values for several, and the table shows
   them all; would read "Each credential has values for one or more
   environments". With none it shows a plain "No credentials in this project
   yet." line where Collections and Webhook security use `EmptyState`. Its
   table repeats much of `CredentialTable` (User settings); one table with
   optional columns would make the two pages match, but moves "System" to
   "Type".
8. **Buttons disabled with only a `title` to say why** (Lane 1's
   reviewers): "Create export" while one is being made, an unfinished
   export's Download, and "Add private credential". A disabled button can't
   be focused and touch never shows a title. Would keep each enabled and say
   why when pressed or in a line beside it.
9. **Where focus goes after a History bulk action** (lane 2, History's
   reviewers). A successful retry, cancel or export clears the picks, which
   hides the selection bar and the button that had focus, so focus drops to
   the top of the page. Would move focus to the notice (`tabIndex={-1}`),
   which shows a focus ring on the callout.
10. **History's counts from the server** (lane 2). "3 new runs enqueued"
   counts the picks; the server answers how many it `enqueued` and
   `discarded` (a deleted workflow's, a wiped input's) and how many it
   `cancelled`. Would word the notice from the server's numbers ("2 new runs
   enqueued; 1 skipped, its workflow was deleted"). Also: across projects a
   retry goes project by project, so when a later project refuses, the
   earlier ones have already run and trying again retries them twice; the
   hooks would need to say which projects went through.
11. **Run history's "now" on Lightning** (lane 2, Insights' reviewers).
   Every count of recent runs (Insights, a project's Overview, the editor's
   runs bar) counts back from the fixtures' fixed "now", 20 Oct 2026
   (`activityNow` in `model/runs.ts`), so on `/v3` every run since then
   lands on the last day and the week labels are October's. Would count
   back from the real time on the Lightning build; that needs the build's
   choice of clock passed down from `src/app/`, the one place that reads
   it.
12. **Overview's add-a-system catalog** (lane 2, waiting on lane 5). The
   adaptors and suggested systems the "Add connected system" form offers
   still come from fixtures (`fixtures/adaptors.ts`,
   `recommendedSystems` in `fixtures/connected-systems.ts`, which lane 5
   owns). Once lane 5 puts them on a demo route for the Systems page,
   Overview's wrapper reads the same and lane 2 reads no fixtures.
13. **Overview without a Status tile** (lane 2). Left out because api/
   can't say what's down (api-gaps.md); the home page now opens on two
   tiles. Would bring it back reading a health resource, or from recent
   runs (a workflow whose latest run failed counts as an issue) if that
   reading is good enough.
14. **Create on primitives, with an empty state** (lane 4, from its
   reviewers). The Create page still lays itself out with `className` and
   its own `<h1>`, not `PageHeader`, `Stack` and `Grid`, and with no ideas it
   shows "Ideas to get you started" over nothing. Would move it onto the
   primitives and add an `EmptyState`; both change its look.
15. **Where a refused confirm says why** (lane 5, a system's page; from its
   reviewers). A refused Revoke or Delete closes its confirm and shows an
   alert callout under the page header, as Workflows does, so a Revoke
   pressed at the bottom of the page is answered at the top, and a typed
   name is lost. Would keep the confirm open with the reason inside it (an
   `error` prop on `ConfirmModal`), or show a refused Revoke in the Access
   section. Also seen there, not new: after a successful Revoke the row is
   gone, so focus falls to the page and nothing says it worked; would move
   focus to the Access heading and add a status line.
