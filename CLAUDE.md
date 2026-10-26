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

Existing building blocks to reach for: `PageHeader` (top of every page), `Button`, `IconToggleButton`, `Card`, `SectionHeading`, `FormField`, `FormControls` (`TextInput`, `TextArea`, `Select`, `RadioOption`), `ToggleSwitch`, `DataTable`, `ListRow`, `ChannelRow`, `SegmentedControl` (`boxed` filters, `pill` view switchers), `DropdownMenu` (actions from any trigger), `MenuButton`, `Picker`, `Modal`, `ConfirmModal`, `Badge`, `Callout`, `EmptyState`, `ProgressBar`, `TextLink`, `SettingsNav`, `SettingsLayout`, `Breadcrumbs`. Button labels use sentence case ("New workflow", not "New Workflow").

### Workflow editor

The editor (`src/components/workflow/`) is laid out like an IDE: `EditorShell` (toolbar, main surface, right dock, bottom dock), `EditorToolbar` (the `Fn` `WorkflowFileMenu`, `SandboxChip`, the workflow title (name • version, which opens the version `Picker`), Canvas/Code switcher, `RunMenuButton` with the main action, and the assistant toggle in its own group), `EditorPanel` (on the canvas docked right by default or floating along the bottom; under the code in code mode) and `EditorTray` on the right. Keep the toolbar to those controls. On the canvas the default side UI is `StepInspector`, a compact card floating over the right edge (the shell's `rightOverlay` slot) for the selected node: name, adaptor and credential (or the trigger's type, URL and switch) and, with a run loaded, `DataSnippet` sections for its log, input and output that show a few lines and expand to full width (80 columns). It takes the layout menu in its header and shows only while the panel is closed; "Open in panel" hands over to the panel. **Anything about runs is a view in the panel**: add it to `panel-views.ts` and `PanelViewId`, render its body in `WorkflowEditorTemplate`, and the panel's tab bar, collapse and maximise come for free. Apart from the canvas panel, the right dock belongs to the assistant, which always takes the outermost column. Layout (explorer, panel, panel view, canvas panel dock, details column, assistant) lives in `src/editor-layout.ts`, is remembered across workflows, and is edited only from `LayoutMenu` (the ⋯ with a checkbox per area: top-right corner of the code area, or on the canvas in the panel header or the canvas corner). Never add layout toggles to the toolbar. Code mode is `CodeWorkspace`: `EditorExplorer` on the left in Workflow / Steps / Components groups (each adds from a + on its heading: a new doc, a step, or the `AddComponentPanel` picker in a `Modal`; steps show their adaptor icon on the left); `CodePaneHeader` (path, adaptor pill, Docs, Run from here) + `CodeEditor` + `EditorStatusBar` in the middle; the details column on the right with two views, Settings (`StepConfigPanel`, `TriggerConfigPanel`, `WorkflowSettingsPanel` or `FileDetailsPanel`) and Reference (`AdaptorReferencePanel`, expanded light-background snippets). Adaptor snippets live in `src/mock-data/adaptor-reference.ts` and surface through `StepConfigPanel` and `AdaptorReferencePanel`.

## Storybook

Every UI component and template has a corresponding `.stories.tsx` file next to it. **When you add, modify, or delete a component, you must update its Storybook story to match.** Specifically:

- **New component** → create a `.stories.tsx` file alongside it with at least a default story and any meaningful variants.
- **Changed props/API** → update the existing story args and variants to reflect the new interface.
- **Deleted component** → delete the corresponding `.stories.tsx` file.
- **Router-dependent components** → use the `withRouter` decorator from `src/stories/decorators.tsx`.
- Stories should use mock data from `src/mock-data/` when possible rather than inventing inline fixtures.

Run `npm run build-storybook` to verify stories compile. This also runs in CI on every PR.
