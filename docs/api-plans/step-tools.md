# Planned: tools in workflows (Report outcome, Human in the loop)

**Status: Planned.** Nothing here is in openfn-3-poc's `api/` or in
Lightning yet. The demo answers it on the fake server, on the routes and
fields marked below, behind the Tools feature flag (`stepTools`). This page
is the proposal for `api/`, written the way `api/conventions.md` writes a
resource, so it can move there once it's agreed.

## Why

Two things civil servants keep asking for that a run's status can't say:

- **What the run meant for the person it served.** A citizen applies for a
  grant, the registry says they aren't eligible, and the refusal SMS goes out
  without a hitch. Lightning calls that run a success, which it was, but the
  application was refused. Report outcome lets the workflow say so: each work
  order gets a business outcome beside its state, and History filters by it.
- **A person deciding before something consequential happens.** Paying a
  grant, issuing an ID or closing a case often needs someone to look first.
  Human in the loop pauses the run, asks someone to approve or reject, and
  carries on with their answer.

Peers do the second the same way, in a few sizes: n8n's "Send and wait for
response" (approve or disapprove, optional free text, a limit on how long to
wait), Zapier's Human in the Loop "Request approval" (a reviewer, a timeout
in minutes to weeks, then continue or stop), and Power Automate's "Start and
wait for an approval" (assignees, Approve or Reject with comments, a timeout
that ends in a `TimedOut` outcome a later step can branch on). Camunda and
Temporal model the same thing as a user task or a signal a workflow waits
for. The plan below is the small version: one approver, Approve or Reject, a
comment, a timeout and what happens then.

## Jobs: `kind` and `config`

A tool is a job, so it sits in the workflow document like any other, is
versioned in snapshots, is copied into sandboxes and is merged back. Two new
fields on a job:

| Field | Type | Notes |
| --- | --- | --- |
| `kind` | `"code"` \| `"report_outcome"` \| `"approval"` | Default `"code"`. Left out means code, so every workflow today is unchanged. |
| `config` | object \| null | A tool's settings, below. Only a tool has one (`not_allowed` on a code job). |

A tool job still has an `adaptor` (`@openfn/language-common`) and a `body`:
the code it runs as on a Lightning or worker that doesn't know tools yet.
The demo writes that code from the config (`toolBody` in
`src/model/step-tools.ts`), so an older worker records the outcome on state
and passes an approval straight through rather than failing.

### `report_outcome` config

| Field | Type | Notes |
| --- | --- | --- |
| `status` | `"success"` \| `"refused"` \| `"failure"` \| `"needs_follow_up"` \| `"partial"` \| `"withdrawn"` | Required (`invalid` otherwise). |
| `description` | string | One line for History. `{{ path }}` is filled in from the step's input state when the step runs. |

### `approval` config

| Field | Type | Notes |
| --- | --- | --- |
| `assignee` | string | Required. Who's asked: a role in the project or a person. Free text for now (see Later). |
| `title` | string | Required. The question; `{{ path }}` reads state. |
| `message` | string | What to check before answering; `{{ path }}` reads state. |
| `fields` | `{ label, path }[]` | Values from state shown beside the message. |
| `comment` | `"optional"` \| `"required_on_reject"` \| `"none"` | |
| `timeout` | `{ amount: integer ≥ 1, unit: "hours" \| "days" }` | `invalid` otherwise. |
| `onTimeout` | `"reject"` \| `"approve"` \| `"fail"` | What happens when nobody answers in time. |

Refusals on save are the usual 422 problem document, one entry per field,
pointed at the field: `#/jobs/3/config/assignee` (`required`),
`#/jobs/2/config/status` (`invalid`), `#/jobs/0/config` (`not_allowed`).

### Where an approved or rejected run goes

The answer goes on state as `approval`:

```json
{ "approval": { "decision": "approved", "by": "Grace Banda", "comment": "…", "at": "2026-10-20T10:12:00Z" } }
```

and the run follows the edge whose condition reads it, with the edge
conditions Lightning already has:

- `js_expression` `state.approval.decision === 'approved'`
- `js_expression` `state.approval.decision === 'rejected'`

With neither, it follows the step's `on_job_success` edge. We considered
having a rejection fail the step so `on_job_failure` edges carry it, but a
refusal isn't an error, and it would show red on the canvas. (For the
record, it wouldn't fail the run either way: kit's worker only fails a run
for a failed leaf step, `calculateRunExitReason` in
`packages/ws-worker/src/api/reasons.ts`.)

## Run and work order state: `waiting`

A new non-final state for runs and work orders, `waiting`: the run reached
an approval step and is paused until it's answered or times out.

- **Runs.** Today a run is `available`, `claimed` or `started` while active,
  then one of the final states (`lib/lightning/runs/run.ex`). `waiting` joins
  the active states, with two new transitions: `started → waiting` (the
  worker reached an approval step) and `waiting → available` (it was
  answered, and the run is queued to carry on). `waiting → cancelled` lets an
  editor stop it.
- **Steps.** The approval step is `waiting` too, with no output dataclip
  until it's answered; then it ends `success` with the answer merged into its
  output.
- **Work orders.** `waiting` joins `pending` and `running` as an active state
  (`lib/lightning/workorders/workorder.ex`), taken from the latest run as
  today. Lists filter by it: `GET /api/projects/:project_id/work_orders?state=waiting`.
- **The worker.** When it reaches an approval job it stops the run there and
  reports a new exit reason, `waiting` (beside `success`, `fail`, `crash`,
  `kill`, `cancel` and `exception` in `@openfn/lexicon`), with the step's
  input as its state, so nothing holds a worker while a person thinks. On an
  answer, Lightning re-queues the same run to start at the approval step's
  next steps, with the answer on state: the runtime can already start a plan
  part-way through, which is how retrying from a step works.
- **One run, not two.** Carrying on keeps the same run (and its id), so a
  work order that waited still reads as one run in History. A retry of it
  makes a new run that asks again.
- **Timeouts.** Lightning schedules the expiry when the run starts waiting
  (`expires_at` on the approval). When it passes, it answers the run itself
  with the step's `onTimeout`: approve or reject (answered `by: null` with
  `timed_out: true`), or fail the step with `error_type: "ApprovalTimedOut"`.

## Answering: `POST /api/runs/:id/approval`

Answers the approval a run is waiting on.

```http
POST /api/runs/7b2c…/approval
Content-Type: application/json

{ "decision": "rejected", "comment": "Had a grant in March" }
```

- `decision`: `"approved"` or `"rejected"`, required.
- `comment`: string; required to reject when the step's `comment` is
  `required_on_reject`.

Answers 200 with the work order (`include=runs`), the run carried on. Who
answered is the caller. Refusals:

| Status | `code` | When |
| --- | --- | --- |
| 403 | `forbidden` | The caller can't edit the project's workflows (viewers can read a waiting run, not answer it). |
| 404 | `not_found` | No such run, or not one the caller can see. |
| 409 | `not_waiting` | The run isn't waiting: answered already, timed out or cancelled. |
| 409 | `scheduled_for_deletion` | Its workflow has been deleted. |
| 409 | `dataclip_wiped` | Its input is gone, so it can't carry on. |
| 422 | `invalid`, `required` | A bad `decision`, or a missing `comment` (pointer `#/comment`). |

A run's `waiting_for` (sent with `include=runs`, and on `GET /api/runs/:id`)
says what's being asked, with the run's values filled in: `step_id`,
`job_id`, `assignee`, `title`, `message`, `fields` (`{ label, value }[]`),
`comment`, `asked_at`, `expires_at`, `on_timeout`.

Later, a list of what's waiting on you across projects
(`GET /api/approvals?state=pending`), so someone who isn't a builder can
answer from one place, and a notification when one is assigned.

## Work order outcome: `outcome_status` and `outcome_description`

Two new columns on `work_orders`, sent as attributes:

| Field | Type | Notes |
| --- | --- | --- |
| `outcome_status` | one of the `report_outcome` statuses \| null | The outcome its latest run reported; null when it reached no Report outcome step. |
| `outcome_description` | string \| null | That step's description, filled in from the run's state. |

The same two go on `runs`, so a retry that ends differently doesn't lose the
first run's outcome; the work order's are its latest run's, as its `state`
is. Lightning sets them when a `report_outcome` step completes (the worker
emits `step:complete` as usual; Lightning sees the job's kind and reads the
step's output `outcome`). If a run passes more than one, the last wins.

- **Filters.** `GET /api/projects/:project_id/work_orders?outcome_status=refused,needs_follow_up`
  (comma separated, as `state` is), and the same on `GET /api/work_orders`
  and on bulk actions' `filter`.
- **Exports.** History exports gain the two columns.
- **Retention.** A description can carry a name ("paid to Esi Owusu"). It's
  kept on the work order, not in a dataclip, so wiping dataclips doesn't
  remove it: Lightning should blank `outcome_description` when the work
  order's dataclips are wiped under the project's retention policy, and keep
  `outcome_status`, which carries nothing personal.
- **Why "Refused".** Work orders already have a `rejected` state: a work
  order whose run was never created (`workorder.ex`). A refused application
  is a different thing, so the outcome is called `refused` to keep the two
  apart in History and in the API.

## What the demo does today

- Tool jobs round-trip through the fake server's workflow routes with `kind`
  and `config`, and are checked as above (`src/fake-api/workflows.ts`).
- Runs that reach an approval step wait, with `waitingFor` on the run; the
  fake server answers `POST /api/demo/runs/:id/approval` (the demo's path for
  `POST /api/runs/:id/approval`) and carries the run on with
  `answerRun` (`src/fixtures/runs.ts`), standing in for the worker.
- Work orders carry `outcome_status` and `outcome_description`, and the list
  filters by `outcome_status` (`src/fake-api/work-orders.ts`).
- Lifecycle tests: `src/fake-api/step-tools.test.ts`.

Left out of the demo: timeouts (shown, never fired), the cross-project inbox,
notifications, matching the assignee to a project role or person, and
outcomes on the run list's bulk-action `filter`.
