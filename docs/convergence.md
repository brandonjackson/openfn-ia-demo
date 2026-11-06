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

- **Branch:** `claude/openfn-3-poc-convergence-upt3ey` (earlier sessions
  used `claude/intelligent-newton-2pncy4`). Each PR is shipped (merged once
  CI is green) and the branch restarted from `main` before the next: `git
  fetch origin main && git checkout -B <branch> origin/main`.
- **PR in progress:** none. PRs 1 to 9 are merged. PR 10 is the last the
  brief asks for: pull openfn-3-poc first (`git -C ../openfn-3-poc pull`)
  and follow any change in api/ or its patterns.
- **Next three items**, one PR each:
  1. **Handbook into its folder** (already on the API; `HandbookPageData`
     and the `Wiki*` types out of page-data.ts, the types to a
     `model/handbook.ts`).
  2. **ProjectSettingsPage into its folder**, starting with the types it
     takes from page-data.ts (`Collaborator`, `WebhookAuthMethod`,
     `GitHub*`, `HistoryExport`, `DataStorageSettings`).
  3. **The system and service pages read the X-Road identity from the API**
     (`useOrganizationXRoad`, as Organization settings now does), taking
     `orgXRoad` out of `SystemPage.query.tsx` and `ServicePage.query.tsx`.
  After those, WorkflowEditorPage.
- **Moving types:** `python3 scripts/move-types.py <from> <to> Name…` moves
  exported declarations (with their doc comments) and rewrites every import
  under src/. Then `npx tsc -b` and add the target's own imports.
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
- **Small follow-ups that don't change the look** (fold into a nearby PR):
  `FormField` should give its hint and error an id and pass
  `aria-describedby`/`aria-invalid` to its control (accessibility review,
  PR 1); `Text` could take a `role` so the Projects count can be
  `role="status"`.

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

**PRs done: 9 of 10.** Pull openfn-3-poc again at PR 10.

## Waiting on Brandon

Changes that would alter how a screen looks or what it says. Not made; each
says what and why.

- **Create project dialog** (`CreateProjectFlow`): rebuild it on the `Modal`
  primitive with an `IconButton` close. Today it isn't announced as a
  dialog, Escape doesn't close it, and focus can leave it (accessibility
  review). Its frame, header and close button would change to Modal's. Its
  title reads "Create Project"; sentence case would be "Create project".
- **Modal focus**: `Modal` itself doesn't trap focus or return it to the
  opener on close. Fixing it there fixes every dialog; no visual change, but
  it touches every modal, so worth a look first.
- **Projects page search**: use `SearchInput` (adds the magnifier) in place
  of a plain search box with a fixed width.
- **Projects page spacing**: the list's 12px gap (`space-y-3`) has no step
  in `Stack` (8px or 16px). Either add a step or move to 16px.
- **Quiet text contrast**: the project count and "No description" use
  gray-400, about 2.5:1 on white, below WCAG AA. `muted` (gray-500) would
  pass for the count.
- **Create project's disabled button**: "Create project" is disabled until a
  name is typed, with nothing saying why. Keeping it enabled and saying
  "Enter a project name" on submit would be clearer.
- **Loading state** (decide before page 2): openfn-3's pattern 5 draws a page's header while its
  data loads, with the spinner or error in the content's place. Here
  `Loaded` replaces the whole page. Moving to the openfn-3 way changes what
  shows while loading.
- **Audit trail's own loading and error state** (React and architecture
  reviews, PR 7): the trail's status is combined into the whole page's, so
  a failed audit request replaces every Admin settings tab with the error,
  and nothing marks the old rows while the next page loads. Giving
  `AuditTrail` its own status (a spinner or callout in the table's place,
  dimmed rows while pending) would fix both; it changes what shows.
- **Audit trail's event filter**: it now offers every event Lightning
  records (33 names, from a fixed list) rather than only those already in
  the trail, so some choices find nothing. If that's too long, group the
  names by item type, or ask for the list in api/audit-events.md.
- **Credential types loaded with the whole page** (React and architecture
  reviews, PR 8): User settings waits for the schema list and every schema
  before drawing any section, so a slow or refused schema (Lightning answers
  503 `not_ready` while it loads adaptors) blanks Profile and API tokens
  too; against a real instance that's one request per adaptor. The fix is
  to load only the list for the picker and fetch a schema when it's picked,
  but that means the picker loses its description line (api-gaps) and the
  form needs a loading state of its own.
- **Organization settings' X-Road section** (reviews, PR 9): the X-Road
  identity's status is combined into the whole page's, so if it fails to
  load, Members, Visibility, Context and Billing show the error too. Scoping
  it to the X-Road section would change what shows. And a Security Server's
  "Last seen" is now a seeded timestamp, so it ages with the demo's data
  ("2 minutes ago" becomes "3 hours ago" later on) instead of always reading
  the fixture's words, as every other seeded time already does.
