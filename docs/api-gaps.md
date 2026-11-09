# API gaps: what the demo needs that api/ doesn't have

One entry per thing a screen here needs that openfn-3-poc's `api/` (planned
scope included) can't give. Each says where it shows, what the API would need
to send, and what the page does until then. A page never fakes a gap: it
leaves the thing out, or reads it from the demo's own routes under
`/api/demo/`, shaped by `api/conventions.md` so it's easy to swap for a real
route later. The template is openfn-3-poc's `docs/api-gaps.md`.

Three lists: whole areas the demo designs that `api/` has nothing for yet,
single fields or answers missing from a resource `api/` does cover, and what
`api/` plans that the fake server answers but Lightning's `full-api-test`
doesn't send yet, which shows only when the app runs on Lightning
([lightning-backend.md](./lightning-backend.md)).

## Areas api/ doesn't cover yet

Each is answered by the fake server on a `/api/demo/` route. Turning one into
a Lightning route is a change to `api/` (Brandon's), then to that route's
path in its hook file.

- **Published services** (Services catalog, a service's page, a project's
  card on Projects and Overview). Would need `GET /api/services` and
  `/api/projects/:id/services`, each service with its workflow, status
  (`Live`, `Draft`), code, MCP and X-Road publication, and for the catalog
  who offers it (`section`), its MCP tool name and the organisation's MCP
  server. Demo: `/api/demo/services` (`src/api/services.ts`), and
  `mcp_server_url` on `/api/demo/organization`.
- **What connected systems offer to workflows** (Services catalog: read
  from a system, write to it, or start a workflow on its events). Demo, read
  only: `/api/demo/connected_systems/channels` (`useSystemChannels`); a
  system's leave with it. Without the service catalog
  flag the pages leave services out and load nothing.
- **Connected systems and their access grants** (Systems, a system's page,
  Overview, the editor's "Connect a system"). Would need a
  `connected_systems` resource with its environments and grants. Demo:
  `/api/demo/connected_systems` (`src/api/connected-systems.ts`).
- **The catalog a new system is picked from, and the ecosystem map**
  (Systems, Overview). Would need the adaptors Lightning can use (it has a
  registry, but `api/` doesn't list it), suggestions of systems to connect,
  and somewhere to keep where each system sits on the map. Demo, read only:
  `/api/demo/adaptors`, `/api/demo/connected_systems/suggestions` and
  `/api/demo/ecosystem` (stations named by system id; a deleted system
  leaves the map). An adaptor's `id` is its package name, not a UUID.
- **The organisation, beyond its name and members** (Organization settings:
  visibility defaults, context layers, Security Server, billing, and its X-Road
  identity, read only; a system's and a service's page read the identity too).
  Its name, your role and its members are the API's
  (`/api/organizations`, api/organizations.md, Planned there and on
  `full-api-test`); the rest isn't in api/ yet. Demo: `/api/demo/organization`
  and `/api/demo/organization/xroad` (`src/api/organization.ts`). Also not in
  api/'s first cut, so not in the demo: choosing between several
  organisations (the demo shows the first you're in), inviting someone with
  no OpenFn account (adding takes an existing user's email), and a superuser
  managing an organisation they aren't in (the API allows it; the page offers
  changes to admins only).
- **The X-Road directory** (a system's page reached over X-Road: the member
  and service its route goes to). Would need the members on the
  organisation's X-Road instance with their subsystems and services, as its
  Security Server lists them (`listClients`). Demo: read only, at
  `/api/demo/organization/xroad/directory` (`useXRoadDirectory`). A member's
  `id` is its name in the directory, not a UUID: it isn't a record of ours,
  and a system's X-Road route names it.
- **The handbook** (Handbook: its files and its article). Demo:
  `/api/demo/handbook` (`src/api/handbook.ts`).
- **Project components besides workflows, channels and collections** (forms,
  artifacts, AI skills, documents, static websites). Demo:
  `/api/demo/projects/:id/components` (`src/api/project-components.ts`).
- **Saving and naming dataclips** (the editor's Saved dataclips, its
  "Add to workflow" and "Edit in sandbox"). api/dataclips.md lists a
  project's dataclips (Planned), but has no way to save an input under a
  name, describe it, or rename it. Would need a create (name, description,
  JSON body, optionally a workflow) and an update of the name and
  description, a name unique in the project. Demo:
  `POST /api/demo/projects/:id/dataclips` and
  `PATCH /api/demo/projects/:id/dataclips/:id` (`src/api/dataclips.ts`);
  making a sandbox brings saved ones across with `dataclip_ids`, and a
  reviewed copy of a run's input is saved in the new sandbox afterwards.
- **Maintenance jobs** (Admin settings, Maintenance). Lightning's
  `/settings/maintenance` has no API. Would need a list of jobs with when
  each last ran, and a way to run one. Demo: `/api/demo/maintenance`
  (`src/api/maintenance.ts`).
- **The demo's view of you** (`/api/demo/me`) and **Reset demo data**
  (`/api/demo/reset`): the demo's own controls, not product gaps.

- **The editor's demo behaviours** (the workflow editor). What isn't a
  record a server sends still comes from fixtures, on every build: the
  adaptor catalog and snippets (`adaptor-catalog.ts`,
  `adaptor-reference.ts`; would need a list of adaptors with their
  credential schemas and docs), the assistant's summaries, replies and past
  conversations (`code-summaries.ts`, `assistant.ts`; api/ai-assistant.md
  plans AI sessions), a run started in the editor (`simulateRun`; would need
  Lightning's worker behind `POST` a work order), the workflow's context and
  spec docs (`workflow-files.ts`, behind the workflow docs flag), and the
  starter workflow and channel for "New workflow" from the Services catalog.

- **What isn't running right now** (Overview's Status tile, the Status
  page). Nothing in api/ says which systems or workflows are down or
  degraded: the Status page still draws the fixtures' (`StatusPage.fixtures`),
  and Overview, now on the API, leaves its Status tile out on every build.
  Would need a health resource (each workflow's and connected system's
  state, and since when), or a rule for reading it from recent runs that
  Brandon agrees.

## Missing from a resource api/ covers

- **Workflows: a description and who edits them** (a project's Workflows
  list and Overview; api/workflows.md). The workflow object has neither a
  `description` nor its editors, and Lightning keeps neither. The rows used
  to take them from the fixtures; now they leave both out, on every build
  (`WorkflowListItem`'s `description` and `members` are optional, and
  `WorkflowRow` drops its Members column without them). Would need a
  `description` on the workflow (Lightning has one on templates only) and
  its recent editors, say from its snapshots' authors.

- **Admin settings: users, for a superuser** (Admin settings, Users;
  api/users.md). `GET /api/users` and the user routes take the service
  account's token only, so a superuser signed in to Lightning is refused
  (403), and on Lightning the page shows Not Found. Would need the user routes
  to take a superuser's session. Demo: the fake server answers a superuser.

- **Sign-on provider: testing a discovery URL without saving** (Admin
  settings, Authentication; api/authentication.md). `PUT /api/auth_provider`
  checks the URL only as it saves. The form has a Test button. Would need a
  check that saves nothing (say `POST /api/auth_provider/test`). Demo:
  `/api/demo/auth_provider/test`, which answers with what it found.
- **Create: starter ideas** (a project's Create page, behind AI building).
  api/ has no AI building, so nothing lists ideas for a new service. Demo:
  `GET /api/demo/build_ideas` (`src/api/build-ideas.ts`), seeded from the
  fixture; the fake server answers it on every build, Lightning's included.
  Sending a prompt still only says it would draft one.
- **Instance: its name** (the sidebar's logo, the account menu; api/account.md).
  `GET /api/instance` has its URL but no name. Would need a `name` (and, if
  the tile's letters aren't to be worked out from it, `initials`). Demo: the
  fake server adds `name`; without one (on Lightning) the instance goes by its
  URL's host (`instanceName` in `model/account.ts`).
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
- **Credentials: the organisation's that a project can't use yet** (Project
  settings, Credentials; api/credentials.md). The design listed the
  organisation's credentials with an Access column (Granted or No access) and
  "Request access". The API lists only the credentials linked to the project
  and has no organisation and no requests. Would need an organisation's
  credentials, which projects each reaches, and a way to ask for one. Until
  then the table lists the project's linked credentials (name, type,
  environments, owner) and leaves Access and Request access out.
- **Credentials: a line on what each kind connects to** (User settings, the
  credential type picker; api/credentials.md, Credential schemas). The list
  sends a name and a title only. The picker's one-line description ("District
  Health Information System") comes from the top-level `description` of the
  schema's JSON Schema, which the fake server fills; an adaptor whose schema
  has none shows no line. **Requested** (Brandon, 6 Nov 2026): a
  `description` on each entry of `GET /api/credential_schemas`. Until it's
  there the picker leaves the line out and loads a schema only once it's
  picked.
- **Credentials: an environment's values that aren't secret**
  (api/credentials.md never sends a body). The edit form shows each
  environment's non-secret fields. Would need `GET
  /api/credentials/:id/environments` returning those values. Demo: the fake
  server answers that route as a demo extension; a blank secret keeps the
  stored one.

## Planned in api/, not yet in Lightning

The fake server answers these as `api/` plans them; Lightning's
`full-api-test` doesn't send them yet. Found by walking every page on a
local Lightning (lightning-backend.md, Phase 1). Each page copes, as listed;
each needs nothing here once Lightning sends it.

- **Projects: your role and counts** (`include=stats`, api/projects.md). The
  project list doesn't say your role, workflow and member counts or last
  activity. Projects lists every project Lightning sends (it only sends your
  own) with zero counts and "No activity yet".
- **Projects: `permissions`** (api/projects.md). Without them every `can*`
  is false, so on Lightning a project's settings read only and the
  create, edit and delete actions that hang off them are left out.
- **Work orders: their workflow and runs** (`workflow_id` and
  `include=runs`, api/work-orders.md). Lightning sends a work order's state
  and times only. History drops every one as belonging to no workflow, so it
  lists none; the project overview and Workflows count none; and Overview
  and Insights, which add up the runs, show zero. They stopped with a blank
  screen (walked 8 Nov 2026, lightning-backend.md) until the seam
  (`toRecord` in `src/api/work-orders.ts`) read a work order without `runs`
  as having none.
- **Your account: changing it yourself** (User settings, Profile;
  api/users.md, planned additional scope on `PATCH /api/users/:id`).
  Lightning's `main` lets only the service account change a user.
  `full-api-test` takes your own names and contact preference on either
  token, and your email and password on a session stepped up in the last
  five minutes; the fork gets it from there at its next sync. The forms step
  the session up first, with the current password they ask for
  (`POST /api/session`), and a wrong one is said under that field.
- **A project's dataclips** (`GET /api/projects/:id/dataclips`,
  api/dataclips.md). Lightning answers 404; the editor opens without the
  saved inputs to run from.
