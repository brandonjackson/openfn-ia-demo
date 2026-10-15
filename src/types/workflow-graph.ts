/** The collaborative editor's workflow graph (assets/js/collaborative-editor/types). Types only: no data, no behaviour. */

export type EdgeConditionType = "always" | "on_job_success" | "on_job_failure" | "js_expression";

export interface EditorJob {
  id: string;
  name: string;
  /** Adaptor specifier, e.g. `@openfn/language-http@latest`. */
  adaptor: string;
  body: string;
  /** Name of the connected credential, if any. */
  credentialName: string | null;
}

export interface EditorTrigger {
  id: string;
  type: "webhook" | "cron";
  enabled: boolean;
  /** Cron triggers only. */
  cronExpression: string | null;
  /** cronstrue's reading of the expression, as the node sublabel shows it. */
  cronDescription: string | null;
  /** Webhook triggers only: the trigger has at least one auth method. */
  hasAuthMethod: boolean;
  /** Webhook replies before the run starts, or after it completes. */
  webhookReply: "before_start" | "after_completion";
}

export interface EditorEdge {
  id: string;
  sourceTriggerId: string | null;
  sourceJobId: string | null;
  targetJobId: string;
  conditionType: EdgeConditionType;
  conditionLabel: string | null;
  conditionExpression: string | null;
  enabled: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface WorkflowGraph {
  id: string;
  projectId: string;
  name: string;
  /** Snapshot number; the version pill reads "latest" when this is the newest. */
  lockVersion: number;
  concurrency: number | null;
  enableJobLogs: boolean;
  jobs: EditorJob[];
  triggers: EditorTrigger[];
  edges: EditorEdge[];
  /** Top-left of each node's 100x100 shape, in canvas units. */
  positions: Record<string, Position>;
}

export interface WorkflowSnapshot {
  lockVersion: number;
  insertedAt: string;
}

/** An entry in the landing screen's template browser. */
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  tags: string[];
}
