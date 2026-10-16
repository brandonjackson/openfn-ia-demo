# Application patterns

CLAUDE.md says how a page is built from primitives. This file says how a page
*behaves*: what every component does when a request is pending, fails, or
changes the data it shows. These are the patterns that have to be in place
before the replica becomes Lightning's frontend, because they decide the shape
of every API call and every page wiring.

Status of each pattern, as of this commit:

| # | Pattern | Status | Where |
|---|---------|--------|-------|
| 1 | Async action | **Done** | `useAction`, `Button pending`, `FormModal`, `ConfirmModal`, `Spinner` |
| 2 | Form with server errors | Partly: `RequestError.fieldErrors`, `FormModal onFieldErrors` | needs `useForm` |
| 3 | Server-driven list | Todo | History first |
| 4 | Data down, mutations up | Convention; 5 panels break it | see list below |
| 5 | Resource loading states | Todo | needs `AsyncBoundary`, 404, error page |
| 6 | Confirm then act | Done in `ConfirmModal`; 3 other ways remain | retire `window.confirm`, custom modals |
| 7 | Feedback | Convention; mixed today | page toasts, component never does |
| 8 | Live updates | Todo, after 3 | subscription hook |
| 9 | Permission gating | Mostly done | one disabled-with-reason look |
| 10 | Session and route guards | Todo | router-level guard |
| 11 | Page and wrapper | Pilot: Tokens | one page at a time |

Worked example: `src/pages/profile/TokensPage.tsx` and its
`TokensPage.replica.tsx` wrapper (patterns 1, 4, 6, 7, 11).

## 1. Async action

Every handler that will talk to the server is `() => Promise<void>` and runs
through `useAction` (`src/utils/useAction.ts`), or through a primitive that
does (`FormModal`, `ConfirmModal`).

- **Pending.** The triggering `Button` gets `pending`: disabled, spinner,
  `aria-busy`. A modal's Cancel and backdrop are inert while pending. Nothing
  else on the page locks.
- **Success.** The handler resolves. The caller then closes the modal,
  navigates, or toasts. The primitive never closes itself.
- **Failure.** The handler throws (a `RequestError` from `src/utils/errors.ts`
  once wired). The primitive stays where it was: a modal stays open and shows
  the message as an `Alert` above the form; a page button toasts it with
  `useAction`'s `onError`. The user can retry or cancel.
- **Double submit** is impossible: `run` ignores calls while pending.
- **Until wired,** page mutations `await simulateRequest(...)` from
  `src/mock-data/request.ts`, so the pending state is visible in the demo.
  `failNextRequest()` makes the next call reject, for stories and manual checks.

Rules: no `onClick={() => toast("Saved")}` without an awaited request in
between. No `setTimeout` to fake latency inside a component. A sync handler
is allowed only when nothing will ever go to the server (toggling a local
disclosure, copying to clipboard).

## 2. Form with server errors

One form helper owns values, dirty state, client validation and server
field errors. Not built yet; its contract:

- `useForm({ initial, validate })` returns `values`, `set(field, value)`,
  `errors` (per field, `string[]`, client and server merged), `dirty`,
  `reset()`, and `fieldProps(name)` to spread onto `TextInput` etc.
- Client validation runs on blur and on submit, not on every keystroke.
- A `RequestError` with `fieldErrors` from submit lands on the matching
  fields (`FormModal onFieldErrors` already routes it). Lightning's changeset
  messages ("can't be blank", "has already been taken") are used verbatim.
- Save is disabled until `dirty`, on every settings form, matching Lightning.
- Field ids keep Lightning's (`project-settings-form_raw_name`), so the
  compare tooling and the annotations still line up.

Retire the inline `errors={cond ? ["can't be blank"] : []}` computed in
render once this exists.

## 3. Server-driven list

Filtering, sorting and paging are the server's job. The browser holds the
query, not the rows.

- Query state (filters, sort, page, search) lives in the URL via
  `useUrlParams`, using Lightning's own param names (`filters[workflow_id]`,
  `sort_by`, `page`). Reloading the page reproduces the view.
- The page turns the URL into a query (today: a mock-data function that
  filters fixtures; later: a request) and gets back `{ rows, total, page,
  pageSize }`.
- `Table` takes rows and a `state: "loading" | "error" | "ready"`, and shows
  the loading and error treatments itself. `EmptyState` stays for "no rows".
- `Pagination` takes `page`, `total`, `pageSize`, `onPage`. No component
  hardcodes `pageNumber={1}`.
- `useTableSort` becomes sort *state* only; nothing sorts rows in the browser
  except small, fully loaded lists (project members, tabs).

Build it on History first (`HistoryWorkOrdersPage`): nine filters move from
`useState` into the URL, `matchesSearch` and friends move behind one
`workOrdersQuery(params)` in mock-data, and the table shows loading.

## 4. Data down, mutations up

A component never copies a record list into local state and mutates it.

- Records come in as props. Changes go out as `onAdd`, `onRemove`,
  `onUpdate` callbacks that return `Promise<void>`. The page (later the
  query layer) applies the change and re-renders with new props.
- Local state in a component is for *UI* only: which modal is open, which
  row is expanded, draft text not yet submitted.
- `initialX` props are a smell: `CollaborationPanel.initialMembers`,
  `CollectionsPanel`, `WebhookSecurityPanel`, `SecurityPanel`,
  `CredentialIndex`. Each needs its list lifted to its page and `on*`
  callbacks added.

## 5. Resource loading states

Any page or panel built around one record (a project, a run, a credential)
needs the same four treatments: loading, not found, forbidden, error.

- One `AsyncBoundary` primitive (or equivalent) takes a resource state and
  renders `Spinner`, a not-found page, or an `Alert`, and otherwise its
  children.
- A real `NotFoundPage` and `ErrorPage` under `src/pages/`, routed as the
  catch-all. No more `<Navigate to="/projects">` as the not-found treatment.
- Pages don't invent their own "Project not found" text.

## 6. Confirm then act

`ConfirmModal` is the one way to confirm a destructive action. It supports
type-to-confirm, async `onConfirm` (pattern 1), and stays open on failure.

Retire: `window.confirm` (`CredentialFormModal`, `ChannelsTable`,
`WorkflowsTable`), the bespoke `UserDeletionModal` and
`CredentialDeletionModal` (rebuild on `ConfirmModal` with `confirmation`).
The `/…/delete` routes stay, because Lightning has them; they open a
`ConfirmModal`.

## 7. Feedback

- Success is a toast, fired by the **page** (or the hook that ran the
  request), never by a feature component. Components report through
  callbacks; the page decides what to say. Wording is Lightning's flash text.
- Failure that needs reading (a form rejected, a conflict) is an inline
  `Alert` next to what failed. Failure of a one-shot button is an error
  toast.
- A server flash that survives a redirect (login errors, "Project created"
  after navigation) needs a small flash store read once by the shell. The
  `?error=1` simulation on auth pages is a placeholder for it.

## 8. Live updates

History and run show update in place in Lightning (PubSub). The component
contract from pattern 3 must not assume rows are static: rows are keyed by
id, and a subscription hook replaces or inserts rows in the same query
result the page already holds. Build after pattern 3.

## 9. Permission gating

`can*` booleans come from `usePermissions(project)` in the page and are
passed down. Already in place. The remaining rule: a gated action is
*disabled with a reason*, never hidden, unless Lightning hides it. The
reason is `Button`'s `tooltip` or `SectionHeader`'s `permissionsSection`.
No inline role checks in components.

## 10. Session and route guards

`SessionProvider` supplies the user and instance. Still needed, once at the
router: redirect to login when signed out, to `/users/two-factor` when 2FA is
pending, to confirm-required when unconfirmed, to the MFA-required page for
projects that require it, and away from `/settings/*` for non-superusers.
Lightning does this in plugs and `on_mount`; mirror those rules in one
`RouteGuard` component around the route groups in `App.tsx`.

## 11. Page and wrapper

A page that will move to Lightning is two files: the page draws, the wrapper
feeds it. The page file is copied into Lightning unchanged; only the wrapper
is rewritten.

- **`XPage.tsx`** takes everything as props: the records, and an `on*`
  function per action returning `Promise<void>`. It imports nothing from
  `src/mock-data/`, `src/session/` or `react-router-dom`. Its props type
  (`XPageProps`, a comment on each prop) is the contract between the two.
- **`XPage.replica.tsx`** is what `App.tsx` routes to. It holds the fixtures
  in state as the server would, reads URL params, awaits `simulateRequest`,
  fires success toasts and navigates. It is the "page" patterns 4 and 7 mean.
- **In Lightning**, an island wrapper feeds the same `XPage.tsx` from the
  LiveView's `data-*` attributes and turns each `on*` call into a
  `pushEvent`. After an action the LiveView re-renders with new attributes,
  so new props arrive the same way they do in the replica.
- **Shapes are Lightning's**, not the convenient ones: a token arrives
  `masked`, and its secret only once, as `newToken`.
- **The page keeps UI state only**: which modal is open, a draft not yet
  saved. Never its own copy of the records.
- **The page gets a story** with plain props: `withRouter`,
  `withCanvas("h-screen")` and `layout: "fullscreen"` (`PageContent` fills
  its parent, so without a height its body is clipped).

Open: the Generate error toast still lives in `TokensPage.tsx`, and
Lightning's design system has no toast yet. Move it to the wrapper or give
Lightning a toast that maps to `put_flash`.

## How to add a pattern to a component

1. Read the pattern here and the worked example.
2. Change the primitive first, with its story showing the new state
   (pending, failed, loading).
3. Apply it to one page end to end, through `simulateRequest`.
4. Run `node scripts/design-system-metrics.mjs`; nothing should go up.
5. Update the status table above.
