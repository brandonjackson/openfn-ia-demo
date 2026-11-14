/**
 * Tools: steps that aren't code. A Report outcome step records what a run
 * meant for the person it served (an application approved, refused, waiting
 * on someone), which is often not the run's status: a refusal sent without a
 * hitch is a successful run with a "Refused" outcome. A Human in the loop
 * step stops the run and asks someone to approve or reject it, then carries
 * on with their answer on state.
 *
 * A tool step is still a job, so a Lightning that doesn't know tools runs it
 * as the code `toolBody` writes, on the common adaptor. The plan for the API
 * is in docs/api-plans/step-tools.md.
 */
import type { LucideIcon } from "lucide-react";
import { Flag, UserCheck } from "lucide-react";
import type { Workflow, WorkOrder } from "./workflow";

/* ------------------------------------------------------------------ */
/*  Report outcome                                                     */
/* ------------------------------------------------------------------ */

/** What a run meant for the person or case it served. */
export type OutcomeStatus = "success" | "failure" | "refused" | "needs_follow_up" | "partial" | "withdrawn";

/** How an outcome is drawn: its colour, from the theme. */
export type OutcomeTone = "green" | "red" | "amber" | "blue" | "gray";

/** The outcomes a Report outcome step can record, in the order they're offered. */
export const outcomeStatuses: { id: OutcomeStatus; label: string; description: string; tone: OutcomeTone }[] = [
  { id: "success", label: "Success", description: "The service was delivered: the application approved, the record made.", tone: "green" },
  { id: "refused", label: "Refused", description: "Refused under the rules: not eligible, a duplicate, or incomplete.", tone: "red" },
  { id: "failure", label: "Failure", description: "The service couldn't be delivered, however well the run went.", tone: "red" },
  { id: "needs_follow_up", label: "Needs follow-up", description: "Someone has to pick it up: a case to review, a document to chase.", tone: "amber" },
  { id: "partial", label: "Partially completed", description: "Some of it was done, say the ID issued but the SMS not sent.", tone: "blue" },
  { id: "withdrawn", label: "Withdrawn", description: "The applicant withdrew, or the request was cancelled.", tone: "gray" },
];

export const outcomeStatus = (id: OutcomeStatus) => outcomeStatuses.find((o) => o.id === id) ?? outcomeStatuses[0];

/** A Report outcome step: the outcome it records and a sentence saying why, which can use the run's state. */
export interface OutcomeTool {
  kind: "outcome";
  status: OutcomeStatus;
  /** One line on what happened, e.g. "National ID {{ nationalId }} issued". `{{ path }}` reads the run's state. */
  description: string;
}

/** The outcome a run recorded, as History shows it. */
export interface RunOutcome {
  status: OutcomeStatus;
  /** The step's description, with the run's values filled in. */
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Human in the loop                                                  */
/* ------------------------------------------------------------------ */

/** Whether whoever answers can leave a comment, and when they must. */
export type ApprovalComment = "optional" | "required_on_reject" | "none";

/** What happens when nobody answers in time. */
export type ApprovalTimeoutAction = "reject" | "approve" | "fail";

export const approvalTimeoutActions: { id: ApprovalTimeoutAction; label: string; description: string }[] = [
  { id: "reject", label: "Reject it", description: "Carry on as if it was rejected." },
  { id: "approve", label: "Approve it", description: "Carry on as if it was approved." },
  { id: "fail", label: "Fail the run", description: "Stop here, failed, so it can be retried." },
];

export const approvalComments: { id: ApprovalComment; label: string }[] = [
  { id: "optional", label: "Optional" },
  { id: "required_on_reject", label: "Required to reject" },
  { id: "none", label: "No comment" },
];

/** A piece of the run's state shown to whoever's asked, beside the message. */
export interface ApprovalField {
  label: string;
  /** Where on state it's read from, e.g. "application.given_name". */
  path: string;
}

/** A Human in the loop step: who's asked, what they see, and how long the run waits. */
export interface ApprovalTool {
  kind: "approval";
  /** Who's asked: a role in the project ("Registrar") or a person. */
  assignee: string;
  /** The question, e.g. "Pay {{ applicant.name }} a hardship grant?". `{{ path }}` reads the run's state. */
  title: string;
  /** What they read before answering, which can use the run's state too. */
  message: string;
  /** Values from the run shown beside the message. */
  fields: ApprovalField[];
  comment: ApprovalComment;
  /** How long the run waits for an answer. */
  timeout: { amount: number; unit: "hours" | "days" };
  onTimeout: ApprovalTimeoutAction;
}

/** What someone answered, which the step puts on state as `approval`. */
export type ApprovalDecision = "approved" | "rejected";

/** An answer to a Human in the loop step: put on state as `approval`, and on the run's step. */
export interface ApprovalAnswer {
  decision: ApprovalDecision;
  /** Who answered, or "Timed out" when nobody did. */
  by: string;
  comment?: string;
  /** When, for display. */
  at: string;
}

/** A run waiting on a person: what they're asked, as History and the editor show it. */
export interface ApprovalRequest {
  /** The run's step that's waiting, and the job it runs. */
  stepId: string;
  jobId: string;
  assignee: string;
  /** The question and message with the run's values filled in. */
  title: string;
  message: string;
  /** The fields, with the run's values. */
  fields: { label: string; value: string }[];
  comment: ApprovalComment;
  /** When it was asked and when it times out, for display. */
  asked: string;
  expires: string;
  onTimeout: ApprovalTimeoutAction;
}

/* ------------------------------------------------------------------ */
/*  Tools                                                              */
/* ------------------------------------------------------------------ */

export type StepTool = OutcomeTool | ApprovalTool;
export type StepToolKind = StepTool["kind"];

/** The tools "Add a step" offers, with how each is named and drawn. */
export const stepToolTypes: Record<StepToolKind, { label: string; description: string; icon: LucideIcon }> = {
  outcome: {
    label: "Report outcome",
    description: "Record what the run meant for the person it served: approved, refused, needs follow-up.",
    icon: Flag,
  },
  approval: {
    label: "Human in the loop",
    description: "Stop and ask someone to approve or reject before the run carries on.",
    icon: UserCheck,
  },
};

export const stepToolKinds: StepToolKind[] = ["outcome", "approval"];

/** A new tool step's settings, before anyone changes them. */
export function newStepTool(kind: StepToolKind): StepTool {
  return kind === "outcome"
    ? { kind: "outcome", status: "success", description: "" }
    : {
        kind: "approval",
        assignee: "",
        title: "Approve this?",
        message: "",
        fields: [],
        comment: "optional",
        timeout: { amount: 3, unit: "days" },
        onTimeout: "reject",
      };
}

/** A new tool step's name. */
export const newStepToolLabel = (kind: StepToolKind) => (kind === "outcome" ? "Report outcome" : "Ask for approval");

/** The value at `path` ("application.given_name") on `state`, as text; empty when it's not there. */
export function readPath(state: unknown, path: string): string {
  let value: unknown = state;
  for (const key of path.split(".").map((k) => k.trim()).filter(Boolean)) {
    if (value === null || typeof value !== "object") return "";
    value = (value as Record<string, unknown>)[key];
  }
  if (value === undefined || value === null) return "";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

/** `text` with each `{{ path }}` replaced by its value on `state`. */
export function fillTemplate(text: string, state: unknown): string {
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path: string) => readPath(state, path));
}

/** A one-line summary of a tool step's settings, for its canvas card and the inspector. */
export function toolSummary(tool: StepTool): string {
  if (tool.kind === "outcome") return `**Records "${outcomeStatus(tool.status).label}"**${tool.description ? `: ${tool.description}` : ""}`;
  return `**Asks ${tool.assignee || "someone"}** to approve or reject, waiting up to ${tool.timeout.amount} ${tool.timeout.unit}.`;
}

/**
 * The code a tool step runs as on a Lightning that doesn't know tools: the
 * common adaptor's `fn`, so the step still does something sensible, and the
 * settings ride along for one that does.
 */
export function toolBody(tool: StepTool): string {
  if (tool.kind === "outcome") {
    return `// Report outcome: set in the step's panel, not here.
fn(state => {
  state.outcome = ${JSON.stringify({ status: tool.status, description: tool.description })};
  return state;
});
`;
  }
  return `// Human in the loop: set in the step's panel, not here.
// Lightning pauses the run here until ${tool.assignee || "someone"} answers.
fn(state => state);
`;
}

/**
 * The workflow with its tool steps as plain code steps, for when tools are
 * switched off: they run the code `toolBody` wrote for them.
 */
export function withoutStepTools(workflow: Workflow): Workflow {
  if (!workflow.nodes.some((n) => n.type === "job" && n.tool)) return workflow;
  return {
    ...workflow,
    nodes: workflow.nodes.map((n) => {
      if (n.type !== "job" || !n.tool) return n;
      return { ...n, tool: undefined };
    }),
  };
}

/** Work orders without what tools add to them (outcomes, what a waiting run asks), for when tools are switched off. */
export function withoutToolResults<T extends { workOrder: WorkOrder } | WorkOrder>(orders: T[]): T[] {
  const strip = (wo: WorkOrder): WorkOrder => ({
    ...wo,
    outcome: undefined,
    runs: wo.runs.map((r) => ({ ...r, outcome: undefined, waitingFor: undefined })),
  });
  return orders.map((o) => ("workOrder" in o ? { ...o, workOrder: strip(o.workOrder) } : (strip(o as WorkOrder) as T)));
}

/** The path of the edge a decision follows out of a Human in the loop step: the one whose expression names it. */
export const decisionExpression = (decision: ApprovalDecision) => `state.approval.decision === '${decision}'`;
