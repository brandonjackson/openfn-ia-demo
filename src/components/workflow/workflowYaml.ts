import type { WorkflowGraph } from "../../types/workflow-graph";

const slug = (s: string) => s.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");

/** The graph as Lightning's workflow YAML (the "Workflow as Code" panel), roughly. */
export function workflowToYaml(g: WorkflowGraph): string {
  const name = (id: string) => {
    const j = g.jobs.find((x) => x.id === id);
    if (j) return slug(j.name);
    const t = g.triggers.find((x) => x.id === id);
    return t ? t.type : id;
  };
  const lines = [`name: ${g.name}`, "jobs:"];
  for (const j of g.jobs) {
    lines.push(`  ${slug(j.name)}:`, `    name: ${j.name}`, `    adaptor: '${j.adaptor}'`, "    body: |");
    for (const l of j.body.replace(/\n$/, "").split("\n")) lines.push(`      ${l}`);
  }
  lines.push("triggers:");
  for (const t of g.triggers) {
    lines.push(`  ${t.type}:`, `    type: ${t.type}`, `    enabled: ${t.enabled}`);
    if (t.cronExpression) lines.push(`    cron_expression: '${t.cronExpression}'`);
  }
  lines.push("edges:");
  for (const e of g.edges) {
    const src = e.sourceTriggerId ?? e.sourceJobId!;
    lines.push(`  ${name(src)}->${name(e.targetJobId)}:`);
    lines.push(e.sourceTriggerId ? `    source_trigger: ${name(src)}` : `    source_job: ${name(src)}`);
    lines.push(`    target_job: ${name(e.targetJobId)}`, `    condition_type: ${e.conditionType}`, `    enabled: ${e.enabled}`);
    if (e.conditionLabel) lines.push(`    condition_label: ${e.conditionLabel}`);
    if (e.conditionExpression) lines.push(`    condition_expression: ${e.conditionExpression}`);
  }
  return lines.join("\n") + "\n";
}

/** The workflow's top-level `name:` in an imported YAML document, if it has one. */
export function workflowNameFromYaml(yaml: string): string | undefined {
  return yaml.match(/^name:\s*(.+)$/m)?.[1]?.trim() || undefined;
}
