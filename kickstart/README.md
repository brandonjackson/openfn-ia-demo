# Shared data from project exports

Drop a Lightning project export into `exports/`, run one command, and both
apps show the same project: Lightning (via Kickstart) and the replica (via
generated fixtures). The ids match too, so the same URL opens the same
workflow or job in both.

```bash
npm run kickstart:sync
```

That reads every `exports/*.yaml` and writes:

- `scenario.yaml`: a Kickstart scenario. Load it into a local Lightning from
  its checkout:
  `mix lightning.kickstart <path to this repo>/kickstart/scenario.yaml`
- `src/mock-data/generated/kickstart.ts`: projects, workflows, canvas graphs,
  credentials and adaptor docs, appended to the replica's fixtures.

Commit all three (the export, the scenario and the generated file).
`npm run compare:all` runs the sync and loads the scenario for you.

## Adding an export

1. In Lightning, export the project (Project settings > Setup > Export your
   Project), or `openfn pull` it.
2. **Swap personal emails for demo users** before committing: credential
   owners and any addresses in job bodies. Owners must be one of
   `demo@`, `editor@`, `viewer@` or `super@openfn.org` (the demo seed's users).
3. Save it as `exports/<project-name>.yaml` and run `npm run kickstart:sync`.
4. Load the scenario into your local Lightning (above). Kickstart upserts, so
   re-running it is safe, and it layers on top of the demo seed.

Every project gets Amy (`demo@`) as owner, Esther as editor and Vikram as
viewer (`MEMBERS` in `sync.mjs`); exports don't carry members.

## How the pieces line up

- **Ids.** Kickstart derives each project, workflow, job, trigger and edge id
  from its name (`stable_id/1` in Lightning's `lib/lightning/kickstart.ex`).
  `stableId()` in `sync.mjs` is the same derivation.
- **Adaptor docs.** The IDE's Adaptor API list comes from each adaptor
  version's `ast.json` on cdn.jsdelivr.net, as in Lightning. Needs network;
  `--offline` skips it.
- **Canvas layout.** Lightning auto-lays out workflows without positions;
  `sync.mjs` uses a simple top-down tree that matches it for tree-shaped
  workflows. Fan-ins may not line up exactly.
- **Not carried over:** runs and history (a new project has none in either
  app), collections' contents, channels (Kickstart doesn't support them yet),
  and credential secrets (each credential is created empty).

## Known Lightning issue

Lightning's collaborative editor validates ids with `z.uuidv4()`
(`assets/js/collaborative-editor/types/common.ts`), but Kickstart's ids are
v5. So in Lightning the editor never finishes loading a Kickstarted project:
the version pill stays on "•" and Run and Save stay disabled. Until that's
fixed upstream, change `z.uuidv4(` to `z.uuid(` in your local checkout
(don't commit it) when comparing editor screens.
