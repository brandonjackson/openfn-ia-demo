import type { Workflow } from "./mock-data/workflow";

const quote = (s: string) => JSON.stringify(s);

const indent = (text: string, spaces: number) =>
  text
    .split("\n")
    .map((line) => " ".repeat(spaces) + line)
    .join("\n");

/**
 * The workflow as a YAML document in the shape of OpenFn's workflow.yaml:
 * its triggers, its steps with their code, and the edges between them. Shown
 * as the workflow's "file" in the code view and used for "Export as YAML".
 */
export function workflowToYaml(workflow: Workflow): string {
  const triggers = workflow.nodes.filter((n) => n.type === "trigger");
  const jobs = workflow.nodes.filter((n) => n.type === "job");
  const label = (id: string) => workflow.nodes.find((n) => n.id === id)?.label ?? id;

  return [
    `name: ${quote(workflow.name)}`,
    `project: ${quote(workflow.project)}`,
    "triggers:",
    ...triggers.flatMap((t) => [`  ${t.id}:`, `    type: ${t.triggerType}`, `    label: ${quote(t.label)}`]),
    "steps:",
    ...jobs.flatMap((j) => [
      `  ${j.id}:`,
      `    name: ${quote(j.label)}`,
      `    adaptor: ${j.adaptorPackage}@latest`,
      "    body: |",
      indent(j.body, 6),
    ]),
    "edges:",
    ...workflow.edges.flatMap((e) => [
      `  - from: ${quote(label(e.source))}`,
      `    to: ${quote(label(e.target))}`,
      `    condition: ${e.condition}`,
      ...(e.expression ? [`    expression: ${quote(e.expression)}`] : []),
    ]),
  ].join("\n");
}
