# API gaps: what the demo needs that api/ doesn't have

One entry per thing a screen here needs that openfn-3-poc's `api/` (planned
scope included) can't give. Each says where it shows, what the API would need
to send, and what the page does until then. A page never fakes a gap: it
leaves the thing out, or reads it from the demo's own routes under
`/api/demo/`, shaped by `api/conventions.md` so it's easy to swap for a real
route later. The template is openfn-3-poc's `docs/api-gaps.md`.

Two lists: whole areas the demo designs that `api/` has nothing for yet, and
single fields or answers missing from a resource `api/` does cover.

## Areas api/ doesn't cover yet

Each is answered by the fake server on a `/api/demo/` route. Turning one into
a Lightning route is a change to `api/` (Brandon's), then to that route's
path in its hook file.

- **Published services** (Services catalog, a service's page, a project's
  card on Projects and Overview). Would need `GET /api/services` and
  `/api/projects/:id/services`, each service with its workflow, status
  (`Live`, `Draft`), code, MCP and X-Road publication. Demo:
  `/api/demo/services` (`src/api/services.ts`). Without the service catalog
  flag the pages leave services out and load nothing.
- **Connected systems and their access grants** (Systems, a system's page,
  Overview, the editor's "Connect a system"). Would need a
  `connected_systems` resource with its environments and grants. Demo:
  `/api/demo/connected_systems` (`src/api/connected-systems.ts`).
- **The organisation** (Organization settings: members and invitations,
  visibility defaults, context layers, Security Server). Lightning has no
  organisations. Demo: `/api/demo/organization` (`src/api/organization.ts`).
- **The handbook** (Handbook: its files and its article). Demo:
  `/api/demo/handbook` (`src/api/handbook.ts`).
- **Project components besides workflows, channels and collections** (forms,
  artifacts, AI skills, documents, static websites). Demo:
  `/api/demo/projects/:id/components` (`src/api/project-components.ts`).
- **Maintenance jobs** (Admin settings, Maintenance). Lightning's
  `/settings/maintenance` has no API. Would need a list of jobs with when
  each last ran, and a way to run one. Demo: `/api/demo/maintenance`
  (`src/api/maintenance.ts`).
- **The demo's view of you** (`/api/demo/me`) and **Reset demo data**
  (`/api/demo/reset`): the demo's own controls, not product gaps.

## Missing from a resource api/ covers

- **Sign-on provider: testing a discovery URL without saving** (Admin
  settings, Authentication; api/authentication.md). `PUT /api/auth_provider`
  checks the URL only as it saves. The form has a Test button. Would need a
  check that saves nothing (say `POST /api/auth_provider/test`). Demo:
  `/api/demo/auth_provider/test`, which answers with what it found.
- **Instance: whether it sends usage metrics** (Admin settings, Maintenance;
  api/account.md). `GET /api/instance` doesn't say. Demo: the fake server adds
  `usage_metrics_enabled` to it.
- **Audit trail: free-text search** (Admin settings, Audit trail;
  api/audit-events.md). The route filters by item type, item, actor, event
  and dates, but the page also searches the actor and the item's name and
  id. Would need a `q` parameter. Until then the server pages and filters the
  trail, and only a search reads every event that passes the other filters
  (`useAuditTrail` in `src/api/admin.ts`) and searches and pages them in the
  browser.
- **Audit trail: its total and its event names** (Admin settings, Audit
  trail). The list sends no `meta` (only runs, work orders and log lines
  do), so "Showing 11–20 of 26 events" comes from the last page's link and
  rows (`listPage` in `src/api/client.ts`: one extra request when you're not
  on the last page). Nothing lists which event names exist, so the event
  filter offers a fixed list of the ones Lightning records
  (`auditEventNames` in `model/audit-events.ts`). Would need `meta` on the
  list, and the event names in api/audit-events.md.

- **Projects: a superuser's own projects** (api/projects.md). The list
  answers only your projects, but the demo's fake server answers a
  superuser's list with every project on the instance (the planned superuser
  scope), so the Projects list, Overview and the sidebar keep only those
  you're a member of and that aren't being deleted (`isOpenable`,
  `useProjectSummaries`). Would need a way to ask for "mine" (say
  `?member=me`) once superusers see everything. Until then the filter stays
  in the hook, not in any page.
- **Credentials: environments are open names in api/, three fixed ones
  here** (api/credentials.md). Lightning names a credential's environments
  freely (`main`, `staging`); the demo's design gives every connected system
  and credential exactly `production`, `staging` and `mock` (`Environment` in
  `model/credentials.ts`). Would need api/ to settle on a fixed set, or the
  design to take any name. Until then the demo sends its three names as the
  API's environment names.
- **Credentials: a line on what each kind connects to** (User settings, the
  credential type picker; api/credentials.md, Credential schemas). The list
  sends a name and a title only. The picker's one-line description ("District
  Health Information System") comes from the top-level `description` of the
  schema's JSON Schema, which the fake server fills; an adaptor whose schema
  has none shows no line. Would need a `description` on each list entry, or a
  promise that schemas carry one.
- **Credentials: an environment's values that aren't secret**
  (api/credentials.md never sends a body). The edit form shows each
  environment's non-secret fields. Would need `GET
  /api/credentials/:id/environments` returning those values. Demo: the fake
  server answers that route as a demo extension; a blank secret keeps the
  stored one.
