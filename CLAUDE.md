# CLAUDE.md

## Project overview

A clean React replica of OpenFn Lightning's UI, built page for page against
the behaviour audit in OpenFn/lightning (`annotations/INVENTORY.md`, branch
`claude/tender-mendel-0pejfc`). React + TypeScript, Vite 8, Tailwind CSS 4.

**No backend logic.** Every page renders from static fixtures in
`src/mock-data/`. Interactions that would hit the server (save, delete,
invite, run) only change local React state, or do nothing. The next step is
cross-referencing each page with its annotation and wiring it to the backend,
so keep pages easy to wire: data comes in through mock-data helpers, not
inline literals scattered through the markup.

## Commands

- `npm run dev` — start dev server
- `npm run build` — typecheck and build
- `npm run lint` — run ESLint
- `npm run storybook` — start Storybook on port 6006
- `npm run build-storybook` — build Storybook static site

## Layout

- `src/App.tsx` — the route table. Every route is a Lightning URL
  (`lib/lightning_web/router.ex`), commented with its INVENTORY.md id.
- `src/pages/<area>/` — one file per Lightning view. Named after the
  inventory id (e.g. `history-work-orders` → `HistoryWorkOrdersPage.tsx`).
- `src/components/` — the component library. The app shell (`AppShell`,
  `Sidebar`, `UserMenu`, `Picker`, `PickerButton`, `Header`, `PageContent`,
  `Breadcrumbs`, `ProjectBreadcrumbs`) and shared parts (`Button`, `Table`
  with `Tr`/`Th`/`Td`/`EmptyState`, `PillTabs`, `Modal`, `Toggle`, `Inputs`).
- `src/mock-data/` — fixtures modelled on Lightning's demo seed
  (`lib/lightning/setup_utils.ex`): users, projects, workflows, history.
- `src/theme/` — themes, chosen from the settings button (bottom right).
  Lightning v2 is the default.
- `annotations/` — a copy of the behaviour audit from OpenFn/lightning
  (`annotations/SOURCE.md` says which commit). The annotations panel, opened
  from the settings button, shows the annotation for the element under the
  mouse: the nearest `data-annotation="<id>"`, else the page's view id
  (`src/annotations/viewIds.ts`). Put `data-annotation` on any sub-panel that
  has its own inventory or shared id. To update, replace the folder with the
  branch's current `annotations/` and update SOURCE.md.

## Matching Lightning

- **Copy, don't reinterpret.** Find the view's template in OpenFn/lightning
  (paths are in INVENTORY.md) and port its markup and Tailwind classes as
  closely as React allows. Same headings, labels, button text, empty states,
  column names and order.
- Colour names match Lightning: `primary-*` (indigo), `secondary-*` (gray),
  `info`, `success`, `danger`, `warning` are defined in `src/index.css`.
- Icons are Heroicons as CSS classes, exactly as in Lightning:
  `<span className="hero-folder h-5 w-5" />`, with `-solid`, `-mini` and
  `-micro` suffixes. Prefer these over `lucide-react`.
- Use `cn()` from `src/utils/cn.ts` for conditional classes.
- Every page is `<PageContent header={<Header … />}>` with a `<Centered>`
  body, unless Lightning's page does something else.

## Components

- **Every UI element on a page must be a component in `src/components/`
  with a story.** Pages compose components; they don't hand-roll styled
  buttons, inputs or tables.
- **Need something that doesn't exist yet? Create the component first**, add
  its story, then use it. If an existing component is close, extend it.
- Group a page area's components in a subfolder when there are several
  (`src/components/history/`, `src/components/workflow/`).
- Button labels follow Lightning's own wording, not a house style.

## Storybook

Every component has a `.stories.tsx` next to it.

- **New component** → create a story with a default and meaningful variants.
- **Changed props** → update the story args.
- **Deleted component** → delete its story.
- **Router-dependent components** → use `withRouter` / `withRouterAt` from
  `src/stories/decorators.tsx`.
- Stories use fixtures from `src/mock-data/`.

Run `npm run build-storybook` to verify stories compile. CI runs it on every PR.
