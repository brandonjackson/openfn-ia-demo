# How the demo is built

This is the guide for people working on the demo. CLAUDE.md points agents here too, and adds only the agent-specific details on top, so there's one source of truth for both.

The short version: **everything on screen belongs to one of four layers, and every page is fed by a wrapper beside it.** Today the wrappers read fixtures. Later the same pages can be fed by a LiveView island inside today's Lightning, or by TanStack Query on a new API, without changing the pages.

## The layers

Primitives are the base. Patterns and domain components both sit on them, side by side, and pages sit on top:

```
             ┌─ patterns ─┐
primitives ──┤            ├── pages
             └─ domain  ──┘
```

Each layer only imports from the layers below it, and patterns and domain never import each other: the page is where a pattern and the domain components that fill it meet. Lint enforces this, so the wrong import fails `npm run lint` with a message saying why.

| Layer | Folder | What it's for | Examples | May import |
| --- | --- | --- | --- | --- |
| **Primitive** | `src/components/primitives/` | The smallest pieces, where accessibility and the look live, knowing nothing about OpenFn. | `Button`, `Card`, `NavItem`, `IconTile`, `Modal`, `use-popover` | primitives; types from `model/` |
| **Pattern** | `src/components/patterns/` | The shape of a screen or a region of one, with no OpenFn nouns, so it can be reused anywhere in the app. | `Layout`, `PageHeader`, `PageContainer`, `SettingsLayout`, `EditorShell`, `CodeLayout` | primitives, patterns |
| **Domain** | `src/components/domain/` | Anything in OpenFn's words, from a status badge up to the workflow canvas. | `StatusPill`, `EntityPill`, `Sidebar`, `WorkflowCanvas`, `StepInspector`, `EcosystemMap`, `XRoadDirectory` | primitives, domain, `model/` |
| **Page** | `src/pages/<page>/XPage.tsx` | One screen, built from the layers below. It draws, and nothing else. | `ProjectWorkflowsPage` | any component, `model/` |

Two more folders sit beside the layers rather than in them:

- `src/model/` is the shared vocabulary: types, fixed product words (trigger types, activity periods, X-Road member classes) and pure functions over values you pass in. Every layer can use it, and it imports none of them.
- `src/fixtures/` is the fake server: the records a backend would send. Only wrappers and stories read it.

**Why layers.** Every large React codebase that goes bad goes bad the same way: data fetching, business rules, styling and layout end up mixed together in the same components. Then you can't change the API without touching hundreds of files, and you can't change a button without breaking a page. With layers, each kind of change has one place to happen. A new look is a change to primitives. A new data source is a change to wrappers. A new screen is a page made of parts that already exist.

**Which layer?** Ask what it knows. If it knows nothing about OpenFn and is one small piece, it's a primitive. If it's the shape of a screen or a region, and you could drop it into another product unchanged, it's a pattern. If it knows any of OpenFn's nouns (a run, a workflow, a credential, X-Road, the sidebar's menu), it's domain, however big it is. If you need something from a higher layer, the component is probably in the wrong layer.

**Domain carries meaning, not rules.** A domain component knows what colour "crashed" is and how a cron string reads. It doesn't decide who can delete or what retry does: those arrive as props (`canDelete`, `onRetry`), set by the page's wrapper. It never knows where its data comes from.

Domain is one flat folder. If it ever gets hard to scan, subfolders by part of the product (`domain/editor/`, `domain/systems/`) are fine, but they're only for finding things: there are no separate import rules inside domain.

### Patterns take OpenFn content through slots

Patterns stay reusable across the whole app only if they don't know any of OpenFn's nouns. A list page pattern that imports `RunStatusBadge` now knows about runs, and it can't serve Credentials or Channels without dragging that along. That's how a patterns folder fills up with features: each import points downward, so lint never complains, but the patterns quietly stop being patterns.

So a pattern gets OpenFn content only through slots. Whoever uses the pattern imports both it and the domain components, and hands the domain components to the pattern as `children` or `ReactNode` props:

```tsx
<ListPage title="Credentials" action={...} empty="No credentials yet.">
  <CredentialsTable rows={credentials} />
</ListPage>
```

`ListPage` decides where things go and what shows while loading, empty or blocked. It never knows what a credential is.

That's why patterns can't import domain, and why they can't import `src/model` either: model's types are OpenFn nouns too. A pattern's props are generic (`title`, `action`, `rows: T[]`), never OpenFn's (`workflow`, `run`, `credential`). The test: you could drop it into any other product unchanged.

You'll see it all over the app. `PageHeader` takes `breadcrumbs` as a slot, and pages pass `<Breadcrumbs>`, which knows about the project bar. `Layout` takes the `sidebar` and `logo` as slots, and the app fills them with OpenFn's `Sidebar` and `InstanceLogo`. `EditorPanel` takes its `views`, and the workflow editor passes its run views.

### Domain draws with primitives

A domain component is built from primitives and other domain components, never from a pattern. That keeps the two halves of the library honest: patterns stay free of OpenFn, domain stays free of page layout, and when the look of a row, a card or a menu changes, it changes in one primitive and every domain component follows.

So when a domain component would sit inside a pattern's frame, it doesn't draw the frame. It hands its pieces to the page, and the page puts them in the pattern's slots. Most of the time that's just props. Where the pieces share state, the domain component takes a function as its children and gives the pieces to it:

```tsx
<CodeWorkspace {...props}>
  {(code) => (
    <CodeLayout nav={code.nav} header={code.header} footer={code.footer} bottomTray={panel}>
      {code.main}
    </CodeLayout>
  )}
</CodeWorkspace>
```

`EditorToolbar` hands its groups to `EditorTopBar` the same way. If a domain component seems to need a pattern that's really one small piece (a menu row, a section heading), that piece is a primitive.

**Reach for the core primitives first.** Most of what domain components draw is one of a few shapes, and each has one primitive: a row in a list of places or choices is `NavItem` (side menus, the code explorer, every dropdown and picker); a bordered box is `Card` (a link or a button with `to` or `onClick`); a glyph or logo on a square is `IconTile`; a small label is `Badge` (`shape="tag"` for a kind beside a name); an id or a bit of code in a sentence is `Code`; a form field is `FormField` with a control from `FormControls`. Extend one of these with a prop before writing another.

## The seam

Every page has a folder of its own, named for the page (`src/pages/projects/` for `ProjectsPage`), as in openfn-3-poc (its STANDARDS.md pattern 11):

```
src/pages/projects/ProjectsPage.tsx              draws, and nothing else
src/pages/projects/ProjectsPage.query.tsx        feeds it from the API and the router
src/pages/projects/ProjectsPage.stories.tsx      the page in Storybook, from fixtures
src/pages/projects/ProjectsPage.test.tsx         what the page draws and asks for, fed by props
src/pages/projects/ProjectsPage.query.test.tsx   the wrapper on the fake server: loads, saves, refusals
```

Pages still moving keep the older flat layout (`src/pages/XPage.tsx` beside its wrapper); [convergence.md](./convergence.md) tracks them. The Projects page is the worked example to copy.

The page takes everything as props: where it sits (`node`, `ancestors`, `currentPath`), its `data`, and an `onX` callback for each thing the user can do. Its props type, `XPageProps`, is its contract, written by hand with a comment on every prop. The page's `XPageData` is written beside it; a shape a component shares (a project's card, `ProjectSummary`) lives in its resource's `model/` file, named as in `api/` (`model/projects.ts`). Older pages still take theirs from `src/model/page-data.ts`, which is being split up that way.

The wrapper is the only place that knows where data comes from. It calls the resource's hooks, reads the route, implements the callbacks, and renders the page. It never reads fixtures: what the API can't give yet is left out, and written down in [api-gaps.md](./api-gaps.md).

```
fixtures           ─┐
LiveView island    ─┼─ props down, promises up ─→  XPage.tsx
TanStack Query     ─┘
```

**Props down, promises up.** Data goes down as props. An action that would reach a server is a callback that returns a promise: `onPublishToXRoad: () => Promise<void>`. The page calls it and redraws from the props it gets back. The page never writes its own copy of the result, because **the server is the truth**, the same way LiveView re-renders after an event. Navigation isn't a server action, so it's a plain callback: `onNewWorkflow: () => void`.

The fixture wrappers apply a change straight away and return an already-resolved promise. Because of that, a page can `await` an action and nothing visible changes timing: React settles the whole thing before the browser paints. A wrapper on a real API resolves when the fresh data is back. A page that needs to wait for it (a spinner, an error) just awaits.

**What stays in the page.** UI state stays local: which tab is open, a dropdown, a form you haven't saved yet, the editor's layout. Only things a server would hold go through the seam.

**Switching a data source.** `src/app/PageRoute.tsx` holds the route table that says which wrapper feeds each kind of page. To move a page onto the API, write `XPage.query.tsx` beside the page and point its line in the table at it. The page doesn't change. `pageFrame(route, node, projectName)` (`src/app/page-frame.ts`) is where every wrapper gets the page's node and crumbs, with the project's name as the API has it.

**Tests.** A page's `XPage.test.tsx` draws it with `renderPage` (`src/test/renderPage.tsx`): it feeds props, and each `onX` returns a promise the test answers with `resolve` or `reject`, so pending, success and a refusal are each a step to check. Lint holds it to the page's rules, so it can't reach for fixtures or the API either. The wrapper's `XPage.query.test.tsx` renders it on the fake server (`ApiProvider retry={false}`, `resetFakeApi`, `setWait(0)`, and `failNext` for a refusal) and checks what the server decides. `.test.tsx` runs in jsdom, `.test.ts` in Node.

**The chrome.** The sidebar and the project bar in the breadcrumbs sit around every page, so they're fed once, by the shell's wrapper (`src/app/Shell.query.tsx` in the app, `Shell.fixtures.tsx` in stories), through a small `ShellContext` (`src/components/domain/shell-context.ts`). Only chrome reads it (`Sidebar`, `Breadcrumbs`, and the app when it fills `Layout`'s slots); pages take props.

### The API

The demo is moving onto Lightning's API, as written down in [openfn-3-poc's `api/` folder](https://github.com/OpenFn/openfn-3-poc/tree/main/api), so the data behaves the way it will against a real Lightning: every record has a UUID, a create can be refused with a 422 naming the field, a delete can be refused with a 409, and a change made on one page is what every other page reads next.

```
XPage.query.tsx ──→ src/api/<resource>.ts ──→ src/api/client.ts ──→ src/fake-api/ ──→ db (seeded from src/fixtures/)
     wrapper          hooks: types, mapper,      request(), errors      the pretend         kept in localStorage
                      keys, queries, saves                              Lightning server
```

- **`src/fake-api/`** is a pretend Lightning server. `fakeFetch` takes what `fetch` takes and answers as `api/` says Lightning would: status codes, JSON bodies, and RFC 9457 problem documents for refusals (`api/errors.md`). A route the API marks Planned is answered as its spec says. Its database (`db.ts`) has a table per resource, seeded from `src/fixtures/`, with a fixture's slug turned into a stable UUID (`seedId("project", "project-a")`). Every write is saved in localStorage, so the demo keeps what you did across reloads; when the fixtures change, the next load starts from them again. "Reset demo data", in the feature flag panel, goes back to the seed. Only `src/api/client.ts` imports this folder, so going real is deleting it.
- **`src/api/client.ts`** is the only thing that sends requests. A refusal throws an `ApiError`: show its `message`, branch on its `code`, and put `fieldError("name")` under the field it names.
- **`src/api/<resource>.ts`** holds, in this order: the API's type (snake_case, as sent), the mapper onto the `model/` type the page takes, the query keys, the queries, and the saves. A save is a mutation that invalidates every key it changed, so it resolves once the lists have reloaded: the page's `onX` gets that promise, and the page redraws from fresh props. Only `src/api/` imports TanStack Query.
- **`XPage.query.tsx`** replaces the page's `.fixtures.tsx` wrapper once the page's data is on the API. It calls the hooks, reads the route, and hands the page its data and callbacks, wrapped in `Loaded` (`src/app/Loaded.tsx`), which shows a spinner while the data loads and Not Found when the record isn't there. Point the page's line in `PageRoute.tsx` at it and delete the old wrapper.
- **Areas the API doesn't describe** (connected systems, X-Road, organisations, services and the rest of the demo's new features) get routes under `/api/demo/`, shaped by `api/conventions.md`, so they work the same way and are easy to tell apart from Lightning's own.

Tests for the fake server's lifecycles live beside it (`*.test.ts`, `npm test`).

### Links and navigation

Only primitives and wrappers talk to the router. Components link with the `Link` primitive (or `TextLink`, which looks like a link), so a page mounted where there's no React Router changes one file. Anything else a component used to do with the router becomes a prop: a URL, or an `onX` callback the wrapper implements with `navigate`.

### Model and fixtures

`model/` holds a thing if it would be true whatever server you talk to: the shape of a `Workflow`, the label for a cron trigger, how to count runs along a graph. `fixtures/` holds a thing if a server would send it: these projects, these runs, this organisation's X-Road settings.

When a helper needs a record (the org's X-Road instance, the directory), it takes it as an argument and lives in `model/`. For example, `clientIdOf(org)` replaces a constant that read the org from fixtures.

## A walk through one page

Follow `/projects/project-a/workflows` from the URL to the pixels. Each stop says what that layer is for.

1. **The route.** `src/app/App.tsx` wraps everything in `ShellQuery` and sends the URL to `PageRoute`. *The app decides what's on screen; it doesn't draw any of it.*
2. **The route table.** `PageRoute` finds the node in the IA tree (`model/ia-tree.ts`): its `pageType` is `project-workflows`, so `ProjectWorkflowsPageQuery` gets the route. *One line per kind of page is all it takes to swap where that page's data comes from.*
3. **The wrapper.** `ProjectWorkflowsPage.query.tsx` loads the project and its workflows from the API, and shows Not Found if the project isn't yours to see. It builds the page's data, and turns "New workflow" into opening the editor (`navigate`). *This is the only file that knows about the API and the router. A LiveView island would do the same job differently.*
4. **The page.** `ProjectWorkflowsPage.tsx` takes `ProjectWorkflowsPageProps` and draws them. It keeps one bit of UI state, the sort order. *It draws, and nothing else, so the same file can be copied into Lightning unchanged.*
5. **A pattern.** `PageHeader` puts the breadcrumbs, title, description and main action where every page has them. The page hands it `<Breadcrumbs>` for the trail, because `PageHeader` doesn't know what a project is. *Patterns are shared answers to shared questions, so pages don't each invent their own.*
6. **A domain component.** `WorkflowRow` draws one workflow: its name, whether it's a published service, its latest run as a `StatusPill`, and the people working on it. *It knows OpenFn's words, but not where the workflow came from.*
7. **Primitives.** `Button`, `Select`, `ListRow`, `EmptyState`. *They're where accessibility and the look live, and know nothing about OpenFn.*
8. **Tokens.** Every colour is a Tailwind utility that resolves to a token in `src/theme/theme.css`, which the Style Picker re-skins. *Changing the look is a change here, not in pages.*

## For people who know LiveView

The model is close to LiveView, on purpose.

| LiveView | Here |
| --- | --- |
| `mount` and `handle_params` load the assigns | the wrapper reads the route and fetches data |
| assigns | the page's props |
| `phx-click` / `pushEvent` | an `onX` callback |
| `handle_event` changes state, then the view re-renders | the wrapper's action saves, then the page redraws from fresh props |
| a function component | a domain component or a pattern |

## Feature flags

The demo shows a redesign of today's Lightning with new features on top. Feature flags switch those features off, so the same app can show the full vision or the redesign at about today's scope. The new editor isn't a flag: it's always on, so the old one is never built.

**Where they live.** `src/model/feature-flags.ts` lists every flag: its label, what turning it off takes away, and what it requires. `src/app/feature-flags.ts` holds which are switched on. A `?flags=` parameter in the URL wins, then the last choice made in the flag panel, then everything on. The panel (`FeatureFlagPicker`, mounted beside the Style Picker) switches them, has the two presets, and copies a link with the current choices.

**Requirements.** A flag only takes effect when everything it requires is in effect too, the way flag services handle prerequisites. Turning on X-Road while Connected systems is off leaves X-Road off, and the panel says "Needs Connected systems". It doesn't quietly turn the parent on. The tree today:

```
organizations
├─ connectedSystems
│  ├─ xroad
│  └─ ecosystemMap
├─ serviceCatalog
└─ handbook
components
└─ forms, staticWebsites, aiSkills, documents, artifacts
aiBuild, deployments, workflowDocs: standalone
```

**Who reads them.** The same people who read fixtures: the route table, the shell and the wrappers. Pages and components never do (lint already stops them importing `src/app`).

- The route table trims the IA tree (`visibleTree`): a node with a `flag` that's off is gone, along with everything under it, and its URL shows "This feature is turned off". A node with `whenOff` is renamed instead. Components becomes Channels, for example.
- The shell passes the flags to the chrome through `ShellContext`, so the sidebar and account menu leave out what's off.
- A wrapper leaves out the data or the action for anything that's off, and the page doesn't draw what it isn't given. Where a component always drew something, it got an optional prop instead: `showWorkflowFiles` on the explorer, or `showServiceAnnotations` on the webhook trigger. Shared helpers for wrappers, such as `systemsFor` and `componentsFor`, are in `src/pages/flagged.fixtures.ts`.

**Only the two presets are looked after.** "Full vision" (everything on) and "Lightning redesign" (everything off) are the states that matter. Other mixes work on a best-effort basis.

**Adding a feature.** Decide which flag it belongs to, or add one to `featureFlags` (with `requires` if it builds on another), and then gate it in the places above. **Retiring a flag.** Once a feature is in or out for good, delete the flag and the conditionals that read it.

## The ratchet

`npm run metrics` counts the things the design system wants fewer of:

- `debt:` lint exceptions
- `className` uses outside primitives (per layer)
- raw `<button>`, `<input>`, `<select>`, `<textarea>` and `<table>` in pages
- components without a story

It also checks that every story's title is its layer and its name (`Domain/StepInspector`, `Patterns/PageHeader`).

CI runs `npm run metrics:check`, which fails if any count goes above `metrics.json`. When you lower one, run `npm run metrics:update` and commit the new baseline. The numbers can only go down. That's how a design system stays tidy without arguing about it in review: if the number went up, the build is red.

**Debt.** When old code breaks a new rule and can't be fixed right away, it gets an `eslint-disable` comment that starts with `debt:` and says what would fix it. New work never adds one. Today there's one: `components/domain/adaptor-lookup.ts` reads fixtures to find a system's adaptor from its name. The fix is for the data to carry the adaptor id.

## Decisions

Short notes on the big calls, so nobody "fixes" one back by accident.

- **Pages take props; data lives at the edge.** Route loaders or server components would tie every page to one way of loading data. These pages need to work inside today's LiveView and in a standalone app, and props are the only thing that works in both.
- **Contracts are written by hand.** `XPageProps`, `XPageData` and the shapes in `model/` are written out with a comment per field, and not generated from the API or the fixtures. A mapper in the wrapper absorbs a messy API, so the page stays stable.
- **Patterns and domain sit side by side.** Patterns used to sit above domain, and filled up with features: the editor, the ecosystem map, the X-Road directory. Then they sat below it, which kept OpenFn out of patterns but let domain components reach for page layout. Now neither imports the other: a pattern learns about OpenFn only through a slot, a domain component is built from primitives, and the page puts the two together. A component that's mostly shape but knows one OpenFn noun becomes a pattern by turning that import into a slot; if that isn't small, it lives in domain until someone does.
- **Real folders for layers, not tags.** Lint can only check what it can see in a path. Folders also make the layer the first thing you see in a file's name.
- **The chrome gets a context; pages don't.** The breadcrumbs' project bar is inside every page's header. Threading the project list through 20 pages' props would bury the seam in noise, so the shell's wrapper provides it once.
- **The run simulation in the editor stays synchronous.** Starting a run updates the canvas in the same click today. A real server needs a start-and-subscribe shape, which is a bigger change than this restructure. `onRun` is the seam where that will go.
- **Settings forms with an inert Save keep their drafts locally.** Until a form really saves, its fields are UI state. When it does, it gets an `onSaveX` callback that returns a promise.
