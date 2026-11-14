/**
 * A workflow's docs: context.md, spec.md and any other Markdown file kept
 * alongside it. Named as the demo's `/api/demo/projects/:id/workflow_docs`
 * has them. A sandbox's copy of a workflow has its own, and an edit there is
 * one of the sandbox's changes (`fileChanges` in workflow-changes.ts).
 */

/** One of a workflow's docs. */
export interface WorkflowDoc {
  id: string;
  /** Its file name, e.g. "spec.md". */
  name: string;
  /** Its Markdown. */
  content: string;
}

/** The name a new doc takes: "untitled.md", then "untitled-2.md" and so on, clear of `taken`. */
export function newDocName(taken: string[]): string {
  const names = new Set(taken.map((n) => n.toLowerCase()));
  let name = "untitled.md";
  for (let n = 2; names.has(name); n++) name = `untitled-${n}.md`;
  return name;
}
