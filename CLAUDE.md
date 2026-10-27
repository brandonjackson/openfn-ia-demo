# CLAUDE.md

## Project overview

React + TypeScript app built with Vite 8 and Tailwind CSS 4. UI components live in `src/components/`, page-level templates in `src/templates/`, and mock data in `src/mock-data/`.

## Commands

- `npm run dev` — start dev server
- `npm run build` — typecheck and build
- `npm run lint` — run ESLint
- `npm run storybook` — start Storybook on port 6006
- `npm run build-storybook` — build Storybook static site

## Components and templates

The app is built from a component library, and Storybook is its catalogue.

- **Every UI element in the app must exist as a component in `src/components/` with a story.** Buttons, cards, form fields, toggles, tables, badges, callouts, empty states, menus: if it renders on screen, it is a component.
- **Templates (`src/templates/`) are composed from components only.** Templates wire data and layout together; they should not define their own styled helpers (no local `Card`, `SaveButton`, `ToggleSwitch`, etc.) or hand-roll styled `<button>`/`<input>`/`<table>` markup.
- **Need something that doesn't exist yet? Create the component first**, add its story, then use it in the template. If an existing component is close, extend it (add a prop or variant) rather than copying it.
- Settings pages use `SettingsLayout` (breadcrumbs, title, `SettingsNav` side menu, content). Reuse it for any new settings-style page.

Existing building blocks to reach for: `PageHeader` (top of every page), `Button`, `IconToggleButton`, `Card`, `SectionHeading`, `FormField`, `FormControls` (`TextInput`, `TextArea`, `Select`, `RadioOption`), `ToggleSwitch`, `DataTable`, `ListRow`, `ChannelRow`, `SegmentedControl` (`boxed` filters, `pill` view switchers), `StatTile` (`compact` in narrow cards), `DropdownMenu` (actions from any trigger), `MenuButton`, `Picker`, `Modal`, `ConfirmModal`, `Badge`, `Callout`, `EmptyState`, `ProgressBar`, `BarChart`, `Donut`, `TextLink`, `SettingsNav`, `SettingsLayout`, `Breadcrumbs`. Button labels use sentence case ("New workflow", not "New Workflow").

### Workflow editor

The editor (`src/components/workflow/`) is laid out like an IDE: `EditorShell` (toolbar, main surface with a bar over its top and a card over its right, the assistant's tray on the right), `EditorToolbar` (the `Fn` `WorkflowFileMenu`, `SandboxChip`, the workflow title (name • version, which opens the version `Picker`), Canvas/Code switcher, in code mode a `LoadedRunBar` for a loaded run, `RunMenuButton` with the main action, and the assistant toggle in its own group), `EditorPanel` (under the code in code mode only) and `EditorTray` on the right. Keep the toolbar to those controls. On main, `ReadOnlyNotice` says the workflow is read-only: pinned to the bottom of the canvas (the shell's `bottom` slot) with a link to edit in a sandbox, and as a tag in the code pane's top-right corner. **The canvas has no panel.** Pinned just above the workflow's top card (the canvas's `header`, so it pans with the workflow) sits `CanvasRunsBar`, which sets what the workflow shows: run history over a period (`PeriodPicker` with Off, 24h, 7d, 30d, plus the run and failure counts), just the workflow (Off), or a loaded run with a clear "Unload run" (`LoadedRunBar`, which goes back to the history; no Filter while a run is loaded). Its Filter opens `RunHistoryList` over the canvas for the period; the failed count opens it too. In a sandbox, hovering a card shows a + on its bottom edge that adds a step after it through `ConnectSystemPicker` ("Connect a system", in a `Modal`): a `SettingsNav` of Connected (the project's systems beside the built-in tools, the default), AI (generate, summarize, translate, classify, extract, and the models) and the categories in `src/mock-data/adaptor-catalog.ts`, which holds every adaptor; add new adaptors there, with their logo in `src/assets/adaptors/`. The side UI is `StepInspector`, a compact card over the right edge (the shell's `rightOverlay` slot) for the selected node, with three states that follow the bar: **config** (runs Off: name, adaptor and credential, or the trigger's type, URL and switch, plus the assistant's summary of the step's code from `src/mock-data/code-summaries.ts` with "See full code"); **stats** (run history: runs, failures and success rate as compact `StatTile`s, and `FailureBreakdown` with no period picker or scope switch, since the bar sets the period and the node sets the scope; on the trigger the numbers are the whole workflow's); **run** (a run loaded: `DataSnippet`s for the log, input and output, whose expand opens that view in the code view's panel, and an "Unload run" control). In code mode, anything about runs is a view in the panel: add it to `panel-views.ts` and `PanelViewId`, render its body in `WorkflowEditorTemplate`, and the panel's tab bar, collapse and maximise come for free. The right dock belongs to the assistant, which always takes the outermost column. Layout (explorer, panel, panel view, details column, assistant, whether run history shows on the canvas) lives in `src/editor-layout.ts`, is remembered across workflows, and is edited only from `LayoutMenu` (the ⋯ at the top-right corner of the code area, just left of the X that closes the code view back to the canvas, with a checkbox for the bottom and right panels; the explorer is Ctrl/⌘ + B and the assistant has its toolbar button) or, for the canvas's run history, the runs bar. Never add layout toggles to the toolbar. Code mode is `CodeWorkspace`: `EditorExplorer` on the left in Workflow / Steps / Components groups (Workflow lists its files and, under service.md, Health; each adds from a + on its heading: a new doc, a step, or the `AddComponentPanel` picker in a `Modal`; steps show their adaptor icon on the left); `CodePaneHeader` (for a step, its adaptor pill, which opens Config, then just the step name; a path for anything else) + `CodeEditor` + `EditorStatusBar` in the middle, where an item that isn't text passes `CodeWorkspace` a `pane` that takes the editor's place; the details column on the right with its views, Config (`StepConfigPanel`, `TriggerConfigPanel`, `WorkflowSettingsPanel` or `FileDetailsPanel`) and, for a step, Snippets, the default view (`AdaptorReferencePanel`: the step's own adaptor only, as `SnippetCard`s that insert at the cursor via the `CodeEditor` handle) and, only while a run is loaded, I/O (`RunIOPanel`: the step's input over its output, each at half the height, or on the trigger the run's input, whose expand opens that view in the bottom panel). Running from a step lives in the toolbar's `RunMenuButton`, not the code pane. Adaptor snippets live in `src/mock-data/adaptor-reference.ts` and surface only through `AdaptorReferencePanel`. Health, opened from the explorer, is `WorkflowHealth` in that `pane`. A page like it opens with the bottom and right panels hidden; showing them from the ⋯ menu lasts while it stays open, and opening a code item brings back the remembered layout. It shows the whole workflow's run history (every version, however runs started) for the same period as the runs bar, from `workflowHealth` in `src/mock-data/runs.ts`, with work order outcomes (`Donut`), runs and failed runs over time (`BarChart`), steps with failures and failures by reason (`FailureBreakdown`), where picking a run loads it and opens the step it failed at.

Run counts on the canvas must add up down the graph: `runActivity` counts a run only along the path it walked from the trigger on the graph being shown, so the trigger counts every run, each step counts exactly what its incoming connectors carried, and no count grows as the workflow goes on. Runs that didn't walk this graph from its trigger (another version, a retry from a step) are left out of the counts, totals included, and the runs bar's list says how many.

## Colours

Every colour goes through the design system: Tailwind colour utilities (`bg-*`, `text-*`, `border-*`, `fill-*`, `stroke-*`), which resolve to theme tokens the Style Picker re-skins, or a named CSS variable in `src/theme/theme.css`. No hex, `rgb()` or `hsl()` literals in components or templates, including SVG `fill`/`stroke` attributes and inline styles.

## Storybook

Every UI component and template has a corresponding `.stories.tsx` file next to it. **When you add, modify, or delete a component, you must update its Storybook story to match.** Specifically:

- **New component** → create a `.stories.tsx` file alongside it with at least a default story and any meaningful variants.
- **Changed props/API** → update the existing story args and variants to reflect the new interface.
- **Deleted component** → delete the corresponding `.stories.tsx` file.
- **Router-dependent components** → use the `withRouter` decorator from `src/stories/decorators.tsx`.
- Stories should use mock data from `src/mock-data/` when possible rather than inventing inline fixtures.

Run `npm run build-storybook` to verify stories compile. This also runs in CI on every PR.
