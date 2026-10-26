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

The editor (`src/components/workflow/`) is built from `EditorShell` (toolbar + main surface + right and bottom tray docks), `EditorToolbar` (the `Fn` `WorkflowFileMenu`, `SandboxChip`, version `Picker`, Canvas/Code switcher, assistant toggle, `RunPicker`, `RunMenuButton`) and `EditorTray`. Keep the toolbar to those controls. **Anything that opens beside or under the canvas or code is a tray**: give it a `TrayId` and a placement in `WorkflowEditorTemplate` and render it inside `EditorTray` so it gets the shared header, tabs and close button. The right dock belongs to the assistant alone; everything else (the step tray, the adaptor reference) goes in the bottom dock, one at a time. Runs load through `RunPicker` into whichever view is showing. Code mode is `CodeWorkspace` (`EditorExplorer` on the left, `CodePaneHeader` + `CodeEditor` + `EditorStatusBar` in the middle, the open item's settings on the right: `StepConfigPanel`, `TriggerConfigPanel` or `WorkflowSettingsPanel`). Adaptor snippets live in `src/mock-data/adaptor-reference.ts` and surface through `StepConfigPanel` and `AdaptorReferencePanel`.

## Storybook

Every UI component and template has a corresponding `.stories.tsx` file next to it. **When you add, modify, or delete a component, you must update its Storybook story to match.** Specifically:

- **New component** → create a `.stories.tsx` file alongside it with at least a default story and any meaningful variants.
- **Changed props/API** → update the existing story args and variants to reflect the new interface.
- **Deleted component** → delete the corresponding `.stories.tsx` file.
- **Router-dependent components** → use the `withRouter` decorator from `src/stories/decorators.tsx`.
- Stories should use mock data from `src/mock-data/` when possible rather than inventing inline fixtures.

Run `npm run build-storybook` to verify stories compile. This also runs in CI on every PR.
