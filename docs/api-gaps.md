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
- **The demo's view of you** (`/api/demo/me`) and **Reset demo data**
  (`/api/demo/reset`): the demo's own controls, not product gaps.

## Missing from a resource api/ covers

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
- **Credentials: an environment's values that aren't secret**
  (api/credentials.md never sends a body). The edit form shows each
  environment's non-secret fields. Would need `GET
  /api/credentials/:id/environments` returning those values. Demo: the fake
  server answers that route as a demo extension; a blank secret keeps the
  stored one.
