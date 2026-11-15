/**
 * Edits to a workflow that haven't been saved yet: what the editor holds
 * between a change and the save that follows it. An `Edits` sits on top of
 * the workflow as the server last sent it; `applyEdits` gives the workflow
 * as it's shown, and as it's saved. Each `with…` function answers the edits
 * with one more change, and none of them changes what it's given.
 */
import type { AdaptorInfo } from "./adaptor-reference";
import { placeAfter, ROW_GAP } from "./step-placement";
import { toolBody, toolSummary, type StepTool } from "./step-tools";
import { triggerTypes, type AdaptorKind, type JobNode, type TriggerType, type Workflow, type WorkflowEdge, type WorkflowNode } from "./workflow";
import { defaultCron, triggerSubtitle, triggerSummary } from "./cron";

/** What can change about a step from its settings. */
export interface StepEdit {
  label?: string;
  adaptor?: AdaptorKind;
  /** The step's credential; present and undefined takes it off. */
  credentialId?: string;
  /** The connected system, by id; present and undefined takes it off. */
  system?: string;
}

/** What can change about a path: its condition, expression, label and whether it's on. */
export type EdgeEdit = Partial<Pick<WorkflowEdge, "condition" | "expression" | "label" | "enabled">>;

/** What can change about a trigger from its settings: what kind it is and, for a cron, its schedule. */
export interface TriggerEdit {
  triggerType?: TriggerType;
  cronExpression?: string;
}

/** Edits made in this session, on top of the workflow as loaded. */
export interface Edits {
  labels: Record<string, string>;
  adaptors: Record<string, AdaptorKind>;
  bodies: Record<string, string>;
  credentials: Record<string, string | undefined>;
  /** The connected system each step talks to, where it was changed. */
  systems: Record<string, string | undefined>;
  /** A tool step's settings, where they were changed. */
  tools: Record<string, StepTool>;
  removed: string[];
  added: JobNode[];
  /** The edges into added steps. */
  addedEdges: WorkflowEdge[];
  /** Existing edges pointed at a different step, by edge id: the trigger's, when a step goes in after it. */
  retargeted: Record<string, string>;
  /** Where steps were moved to, by id: those below a step put in after the trigger move down a row. */
  positions: Record<string, { x: number; y: number }>;
  /** Changes to paths, by edge id. */
  edges: Record<string, EdgeEdit>;
  /** Changes to triggers, by trigger id. */
  triggers: Record<string, TriggerEdit>;
}

/** Nothing changed. One object, so "are there edits" is a comparison with it. */
export const noEdits: Edits = {
  labels: {},
  adaptors: {},
  bodies: {},
  credentials: {},
  systems: {},
  tools: {},
  removed: [],
  added: [],
  addedEdges: [],
  retargeted: {},
  positions: {},
  edges: {},
  triggers: {},
};

/** The workflow with the edits applied, under `name`; `info` gives a re-adaptored step its package. */
export function applyEdits(workflow: Workflow, edits: Edits, name: string, info: Record<AdaptorKind, AdaptorInfo>): Workflow {
  // Edits already saved are in the workflow too: adding them again changes nothing.
  const added = edits.added.filter((a) => !workflow.nodes.some((n) => n.id === a.id));
  const addedEdges = edits.addedEdges.filter((a) => !workflow.edges.some((e) => e.id === a.id));
  const nodes: WorkflowNode[] = [...workflow.nodes, ...added]
    .filter((n) => !edits.removed.includes(n.id))
    .map((n) => {
      if (n.type === "trigger") {
        const change = edits.triggers[n.id];
        if (!change) return n;
        const triggerType = change.triggerType ?? n.triggerType;
        const cronExpression = triggerType === "cron" ? (change.cronExpression ?? n.cronExpression ?? defaultCron) : undefined;
        // A trigger that's changed kind or schedule says so on its card: a name it was given is kept, the default one follows the kind.
        const named = n.label !== triggerTypes[n.triggerType].label;
        return {
          ...n,
          triggerType,
          cronExpression,
          label: named ? n.label : triggerTypes[triggerType].label,
          subtitle: triggerSubtitle(triggerType, cronExpression),
          summary: triggerSummary(triggerType, cronExpression),
        };
      }
      const adaptor = edits.adaptors[n.id] ?? n.adaptor;
      // A tool step's settings, changed: the code it runs as and its summary follow them.
      const tool = edits.tools[n.id];
      return {
        ...n,
        ...(tool && { tool, body: toolBody(tool), summary: toolSummary(tool) }),
        ...edits.positions[n.id],
        label: edits.labels[n.id] ?? n.label,
        adaptor,
        adaptorPackage: info[adaptor]?.package ?? n.adaptorPackage,
        body: tool ? toolBody(tool) : (edits.bodies[n.id] ?? n.body),
        system: n.id in edits.systems ? edits.systems[n.id] : n.system,
        credentialId: n.id in edits.credentials ? edits.credentials[n.id] : n.credentialId,
      };
    });
  const ids = new Set(nodes.map((n) => n.id));
  const edges = [...workflow.edges, ...addedEdges]
    .map((e) => (e.id in edits.retargeted ? { ...e, target: edits.retargeted[e.id]! } : e))
    .map((e) => (e.id in edits.edges ? { ...e, ...edits.edges[e.id] } : e))
    .filter((e) => ids.has(e.source) && ids.has(e.target));
  return { ...workflow, name, nodes, edges };
}

/** A step's name, adaptor, credential or system changed. Only what `changes` names is touched. */
export const withStep = (e: Edits, stepId: string, changes: StepEdit): Edits => ({
  ...e,
  labels: changes.label !== undefined ? { ...e.labels, [stepId]: changes.label } : e.labels,
  adaptors: changes.adaptor !== undefined ? { ...e.adaptors, [stepId]: changes.adaptor } : e.adaptors,
  credentials: "credentialId" in changes ? { ...e.credentials, [stepId]: changes.credentialId } : e.credentials,
  systems: "system" in changes ? { ...e.systems, [stepId]: changes.system } : e.systems,
});

/** A trigger's kind or schedule changed, on top of any change already made to it. */
export const withTrigger = (e: Edits, triggerId: string, changes: TriggerEdit): Edits => ({
  ...e,
  triggers: { ...e.triggers, [triggerId]: { ...e.triggers[triggerId], ...changes } },
});

/** A path changed, on top of any change already made to it. */
export const withEdge = (e: Edits, edgeId: string, changes: EdgeEdit): Edits => ({ ...e, edges: { ...e.edges, [edgeId]: { ...e.edges[edgeId], ...changes } } });

/** A step's code changed. */
export const withCode = (e: Edits, stepId: string, body: string): Edits => ({ ...e, bodies: { ...e.bodies, [stepId]: body } });

/** A tool step's settings changed. */
export const withTool = (e: Edits, stepId: string, tool: StepTool): Edits => ({ ...e, tools: { ...e.tools, [stepId]: tool } });

/** A step deleted. */
export const withoutStep = (e: Edits, stepId: string): Edits => ({ ...e, removed: [...e.removed, stepId] });

/** A step still to be placed: everything but where it sits. */
export type NewStep = Omit<JobNode, "x" | "y">;

/**
 * A step added at the end of `graph` (the workflow as shown): under its last
 * step, on a path from it that runs on success. The first step of a workflow
 * with none has no path in.
 */
export function withStepAtEnd(e: Edits, graph: Workflow, step: NewStep, newId: () => string): Edits {
  const last = graph.nodes.filter((n): n is JobNode => n.type === "job").at(-1);
  return {
    ...e,
    added: [...e.added, { ...step, x: last?.x ?? 490, y: (last?.y ?? 70) + ROW_GAP }],
    addedEdges: last ? [...e.addedEdges, { id: newId(), source: last.id, target: step.id, condition: "on_success" }] : e.addedEdges,
  };
}

/**
 * A step added after a node of `graph` (the workflow as shown), from the +
 * on its card. After a step, it's a new branch: its siblings are re-centred
 * under their parent. A trigger has exactly one path out, so after a trigger
 * that already leads somewhere the step goes in between: the trigger's path
 * now leads to the new step, which leads on to where the trigger did, and
 * every step below moves down a row. Undefined when the node isn't there.
 */
export function withStepAfter(e: Edits, graph: Workflow, sourceId: string, step: NewStep, newId: () => string): Edits | undefined {
  const source = graph.nodes.find((n) => n.id === sourceId);
  if (!source) return undefined;
  const outOfTrigger = source.type === "trigger" ? graph.edges.filter((edge) => edge.source === source.id) : [];
  const firstSteps = outOfTrigger.flatMap((edge) => graph.nodes.find((n) => n.id === edge.target) ?? []);
  const first = firstSteps[0];
  if (first) {
    const below = graph.nodes.filter((n) => n.type === "job" && n.y > source.y);
    return {
      ...e,
      added: [...e.added, { ...step, x: first.x, y: first.y }],
      addedEdges: [...e.addedEdges, ...firstSteps.map((n): WorkflowEdge => ({ id: newId(), source: step.id, target: n.id, condition: "on_success" }))],
      retargeted: { ...e.retargeted, ...Object.fromEntries(outOfTrigger.map((edge) => [edge.id, step.id])) },
      positions: { ...e.positions, ...Object.fromEntries(below.map((n) => [n.id, { x: n.x, y: n.y + ROW_GAP }])) },
    };
  }
  const placement = placeAfter(graph, source.id);
  return {
    ...e,
    added: [...e.added, { ...step, ...placement.position }],
    addedEdges: [...e.addedEdges, { id: newId(), source: source.id, target: step.id, condition: source.type === "trigger" ? "always" : "on_success" }],
    positions: { ...e.positions, ...placement.moves },
  };
}
