import type { JobNode, Workflow, WorkflowEdge, WorkflowNode } from "./workflow";
import { triggerTypes } from "./workflow";
import type { ProjectComponentType } from "./component-types";

/** One thing a sandbox's copy of a workflow does differently from where it would go live. */
export interface WorkflowChange {
  /** What happened to it: drawn as a +, − or ~. */
  kind: "added" | "removed" | "changed";
  /** In plain words, e.g. "Added step Send SMS" or "Changed code in Fetch cases". */
  summary: string;
}

/** "No changes", "1 change", "3 changes". */
export function changesLabel(count: number): string {
  return count === 0 ? "No changes" : `${count} ${count === 1 ? "change" : "changes"}`;
}

/** A step, by its fields that going live would carry over. */
const jobFields = (n: JobNode) => ({ body: n.body, adaptor: n.adaptorPackage, credential: n.credentialId ?? "", system: n.system ?? "" });

/**
 * Pairs each node in `current` with the one in `base` it came from: by name
 * first, then, for one renamed, by where it sits on the canvas, which a copy
 * keeps. Returns base id by current id.
 */
function pairNodes(base: WorkflowNode[], current: WorkflowNode[]): Map<string, string> {
  const pairs = new Map<string, string>();
  const taken = new Set<string>();
  const take = (c: WorkflowNode, match: (b: WorkflowNode) => boolean) => {
    const b = base.find((n) => !taken.has(n.id) && n.type === c.type && match(n));
    if (!b) return;
    pairs.set(c.id, b.id);
    taken.add(b.id);
  };
  // The trigger is the trigger, whatever it's called.
  for (const c of current) if (c.type === "trigger") take(c, () => true);
  for (const c of current) if (!pairs.has(c.id)) take(c, (b) => b.label === c.label);
  for (const c of current) if (!pairs.has(c.id)) take(c, (b) => b.x === c.x && b.y === c.y);
  return pairs;
}

/**
 * The node in another copy of a workflow (a sandbox's, or main's) that is the
 * same as `id` in `from`, paired as `workflowChanges` pairs them: the trigger
 * with the trigger, a step by name, then by where it sits. Ids differ between
 * copies, so this is how what's open stays open across a sandbox switch.
 */
export function counterpartNodeId(from: Workflow, to: Workflow, id: string): string | undefined {
  return pairNodes(to.nodes, from.nodes).get(id);
}

/**
 * What a sandbox's copy of a workflow changes, compared with the copy where
 * going live would merge it (`base`; undefined when the workflow is new in
 * the sandbox): steps added, removed, renamed or edited, the trigger's kind,
 * and the connections between steps. Positions on the canvas aren't changes.
 */
export function workflowChanges(base: Workflow | undefined, current: Workflow): WorkflowChange[] {
  // A workflow new in the sandbox is one change, plus one for each step it has, so adding a step still counts.
  if (!base) {
    return [
      { kind: "added", summary: `Added the workflow ${current.name}` },
      ...current.nodes.filter((n) => n.type === "job").map((n): WorkflowChange => ({ kind: "added", summary: `Added step ${n.label}` })),
    ];
  }

  const changes: WorkflowChange[] = [];
  if (base.name !== current.name) changes.push({ kind: "changed", summary: `Renamed the workflow to ${current.name}` });

  const pairs = pairNodes(base.nodes, current.nodes);
  const baseById = new Map(base.nodes.map((n) => [n.id, n]));
  const paired = new Set(pairs.values());

  for (const c of current.nodes) {
    const b = baseById.get(pairs.get(c.id) ?? "");
    if (!b) {
      changes.push({ kind: "added", summary: `Added step ${c.label}` });
      continue;
    }
    if (b.label !== c.label && c.type === "job") changes.push({ kind: "changed", summary: `Renamed ${b.label} to ${c.label}` });
    if (b.type === "trigger" && c.type === "trigger" && b.triggerType !== c.triggerType) {
      changes.push({ kind: "changed", summary: `Made the trigger a ${triggerTypes[c.triggerType].shortLabel.toLowerCase()} trigger` });
    }
    if (b.type === "job" && c.type === "job") {
      const was = jobFields(b);
      const now = jobFields(c);
      const what = [
        was.body !== now.body && "code",
        was.adaptor !== now.adaptor && "adaptor",
        was.credential !== now.credential && "credential",
        was.system !== now.system && "system",
      ].filter((x): x is string => !!x);
      if (what.length) changes.push({ kind: "changed", summary: `Changed ${listOf(what)} in ${c.label}` });
    }
  }
  for (const b of base.nodes) {
    if (!paired.has(b.id)) changes.push({ kind: "removed", summary: `Removed step ${b.label}` });
  }

  // Connections, named by their ends in base's terms so a renamed step's still match.
  const label = (nodes: WorkflowNode[], id: string) => nodes.find((n) => n.id === id)?.label ?? id;
  const baseKey = (e: WorkflowEdge) => `${e.source}→${e.target}`;
  const currentKey = (e: WorkflowEdge) => `${pairs.get(e.source) ?? e.source}→${pairs.get(e.target) ?? e.target}`;
  const before = new Map(base.edges.map((e) => [baseKey(e), e]));
  const after = new Map(current.edges.map((e) => [currentKey(e), e]));
  for (const [key, e] of after) {
    const was = before.get(key);
    const ends = `${label(current.nodes, e.source)} → ${label(current.nodes, e.target)}`;
    if (!was) changes.push({ kind: "added", summary: `Connected ${ends}` });
    else if ((was.enabled !== false) !== (e.enabled !== false)) {
      changes.push({ kind: "changed", summary: `Turned ${e.enabled === false ? "off" : "on"} ${ends}` });
    } else if (was.condition !== e.condition || (was.expression ?? "") !== (e.expression ?? "") || (was.label ?? "") !== (e.label ?? "")) {
      changes.push({ kind: "changed", summary: `Changed when ${ends} runs` });
    }
  }
  for (const [key, e] of before) {
    if (!after.has(key)) changes.push({ kind: "removed", summary: `Disconnected ${label(base.nodes, e.source)} → ${label(base.nodes, e.target)}` });
  }
  return changes;
}

/**
 * What a sandbox changes in its project's components and environment
 * variables, as changes: a sandbox is a copy of its project, so a component
 * added or edited there goes back with the workflow when it merges.
 */
export function componentChanges(changed: { name: string; type: ProjectComponentType | "Environment variable"; change: "new" | "changed" }[]): WorkflowChange[] {
  return changed.map((c) =>
    c.change === "new"
      ? { kind: "added", summary: `Added ${componentNoun(c.type)} ${c.name}` }
      : { kind: "changed", summary: `Changed ${componentNoun(c.type)} ${c.name}` },
  );
}

/**
 * The workflows a merge preview says a sandbox brings back, as changes: one
 * line for each workflow new or changed there. The editor says what changed
 * inside one workflow (`workflowChanges`); this is the whole sandbox's view.
 */
export function previewChanges(workflows: { name: string; change: "new" | "changed" | "unchanged" | "deleted" }[]): WorkflowChange[] {
  return workflows.flatMap((w): WorkflowChange[] =>
    w.change === "new"
      ? [{ kind: "added", summary: `Added the workflow ${w.name}` }]
      : w.change === "changed"
        ? [{ kind: "changed", summary: `Changed the workflow ${w.name}` }]
        : [],
  );
}

/** "channel", "AI skill", "static website". */
function componentNoun(type: ProjectComponentType | "Environment variable"): string {
  return type === "AI Skill" ? "AI skill" : type.toLowerCase();
}

/** "code", "code and adaptor", "code, adaptor and credential". */
function listOf(words: string[]): string {
  return words.length < 2 ? words.join("") : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}
