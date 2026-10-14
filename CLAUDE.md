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
- `node scripts/design-system-metrics.mjs` — count styling outside the
  primitives (className lists, distinct Tailwind tokens, raw elements). Run it
  before and after design-system work; the numbers should go down.

## Layout

- `src/App.tsx` — the route table. Every route is a Lightning URL
  (`lib/lightning_web/router.ex`), commented with its INVENTORY.md id.
- `src/pages/<area>/` — one file per Lightning view. Named after the
  inventory id (e.g. `history-work-orders` → `HistoryWorkOrdersPage.tsx`).
- `src/components/` — the component library: primitives at the top level,
  app chrome (sidebar, project picker, user menu) in `shell/`, feature
  components in area subfolders. See **Components** below.
- `src/utils/format.ts` — every date, duration, size, id and name formatter
  (`capitalize`, `shortUuid`, …). Add new ones here, not in an area folder.
  Other shared helpers sit beside it: `search.ts` (`matchesQuery`),
  `validate.ts` (`isValidEmail`), `useUrlParams.ts`, `useCopy.ts`.
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

This repo is becoming the React frontend that replaces Lightning's
LiveView UI, so Lightning is the source of truth for **what** a page does,
not **how** it's built.

- **Copy behaviour and content exactly.** Find the view in OpenFn/lightning
  (paths are in INVENTORY.md) and match its headings, labels, button text,
  empty states, column names and order, and what each action does.
- **Don't copy its implementation.** Lightning mixes LiveView components,
  the collaborative editor's React components and a half-started new design
  system. Don't port those splits. Build every page from the primitives
  below, and when two Lightning screens style the same thing differently,
  pick one treatment in the primitive rather than copying both.
- One neutral scale: `gray-*`. No `slate`, `zinc` or `secondary`. Brand
  colour is `primary-*` (indigo; don't write `indigo-*`). `info`, `success`,
  `danger`, `warning` are defined in `src/index.css`.
- Icons are Heroicons as CSS classes: `<span className="hero-folder h-5 w-5" />`,
  with `-solid`, `-mini` and `-micro` suffixes. No icon packages.
- Use `cn()` from `src/utils/cn.ts` for conditional classes.
- Every page is `<PageContent header={<Header … />}>` with a `<Centered>`
  body, unless the page needs a different layout.

## Components

The design system has two layers.

**Primitives** (`src/components/*.tsx`) are small, general and used
everywhere. Reach for these first:

| Need | Use |
|---|---|
| An action | `Button` (`to` for routes, `href` for plain links; `size="xs" theme="secondary"` for table row actions) |
| An icon-only action | `IconButton` (always give it a `label`; `to`/`href` for icon links, `tone="danger"`, or pass an SVG element as `icon`) |
| A button that opens a menu | `ButtonMenu`; `SplitButton` when the button also has its own action |
| A form control | `TextInput`, `TextArea`, `Select`, `Checkbox`, `Radio` from `Inputs` (`fieldClassName` styles the wrapper, e.g. `flex-1` in a row); wrap anything else in `Field` with `controlClasses()` and `data-ui="field"` |
| A name that becomes a URL-safe slug | `NameField` (input plus the "will be named" badge) |
| A dialog | `Modal` (`size`, or `bare` for custom layouts) |
| A dialog around one form | `FormModal` (`formId`, `onSubmit`, `submitLabel`; Enter submits, Cancel is built in) |
| Confirming one action | `ConfirmModal`; `confirmation` adds a type-to-confirm field |
| A list of actions or choices | `Menu` with `MenuItem`, `MenuSection`, `MenuDivider` |
| A floating panel (filters, details) | `Popover` (`panelProps` puts `data-annotation` on the portalled panel; Menu takes it too) |
| A searchable list you pick from with the keyboard | `SearchList` |
| Show / hide a section | `Disclosure` (`card`, `section` or `inline`) |
| Switching views | `Tabs` (`underline` or `pill`, horizontal or vertical, buttons or route links) |
| Searching or filtering a list | `SearchInput` |
| A status chip, badge or tag | `Pill` (`color`, `square`, `mono`; `onRemove` makes it removable) |
| Any bordered panel, tile or card | `Card` (`title`/`description`/`action` give it a header; `padding`, `muted`, `dashed`) |
| A heading inside a page | `Heading` (`size` xl/lg/md/sm/eyebrow, `as` for the level) |
| Labelled values | `DetailList` + `DetailItem` (`rows` or `grid`) |
| A timestamp | `DateTime` |
| An on/off switch | `Toggle` |
| An inline link | `TextLink` (`variant="danger"` for destructive ones) |
| Tabular data | `Table` with `Tr`, `Th`, `Td`, `EmptyState` (a clickable `Tr` ignores clicks on links and buttons inside it, so no `stopPropagation`; `<Th actions />` and `<Td actions>` for the row-actions column, `align` for right/centre) |
| Sorting and filtering a table in the browser | `useTableSort` (or `useSort` for state only, when rows are sorted elsewhere) from `useTableSort.ts` |
| "Projects (3)" above a table, with its buttons | `TableTitle` |
| A status message | `Alert` |
| Page frame | `PageContent`, `Header`, `Centered`, `Breadcrumbs` |

Primitives expose their look to the themes through `data-ui` (and
`data-variant` for a variant or tone). Theme CSS targets those hooks, never
element selectors or utility classes, so a new primitive or variant needs its
hook, and the GDS theme is worth a look after styling changes.

Dialogs, menus and popovers sit on Headless UI (`@headlessui/react`), which
handles focus, keyboard and positioning. Don't hand-roll `fixed inset-0`
overlays, click-outside handlers or `absolute` dropdown panels.

**Feature components** (`src/components/<area>/`) are one panel or section
of a page (`WorkOrdersTable`, `WebhookSecurityPanel`). They're often used
once, and that's fine: they're the unit we wire to the backend and annotate.
They compose primitives and don't carry their own button, input, modal or
menu styling.

- **Pages compose components** and hold state, route params and mock-data
  queries. No styled raw `<button>`, `<input>` or `<table>` in pages.
- **Need something that doesn't exist yet?** If it's general, add or extend a
  primitive. If it's specific to an area, make a feature component. Either
  way, add its story first.
- When a pattern repeats across three or more feature components, it's a
  primitive waiting to happen. Promote it.
- Before adding a variant to a feature component, check whether a primitive
  already covers it. Prefer a slightly different look over a second
  implementation.
- Use Tailwind's scale, not arbitrary values (`text-[13px]`, `max-w-[15rem]`),
  except for real geometry such as the workflow diagram.
- Button labels follow Lightning's own wording, not a house style.

## Storybook

Every component has a `.stories.tsx` next to it.

- **New component** → create a story with a default and meaningful variants.
- **Changed props** → update the story args.
- **Deleted component** → delete its story.
- **Router-dependent components** → use `withRouter` / `withRouterAt` from
  `src/stories/decorators.tsx`.
- **Wrappers** (a gray page background, a right-hand side panel, a white
  card, a diagram canvas) → `withGrayPanel`, `withSidePanel`,
  `withWhitePanel`, `withCanvas` from the same file, not inline divs.
- Stories use fixtures from `src/mock-data/`.

Run `npm run build-storybook` to verify stories compile. CI runs it on every PR.
