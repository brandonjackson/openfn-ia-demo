import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import StepInspector from "./StepInspector";
import { nationalIdWorkflow } from "../../mock-data/workflow";
import type { JobNode, TriggerNode, Workflow, WorkflowEdge } from "../../mock-data/workflow";

const search = nationalIdWorkflow.nodes.find((n) => n.id === "search") as JobNode;
const create = nationalIdWorkflow.nodes.find((n) => n.id === "create") as JobNode;
const trigger = nationalIdWorkflow.nodes.find((n) => n.type === "trigger") as TriggerNode;

/** Keeps edits in state so the fields respond. */
function Editable({ nodeId, readOnly }: { nodeId?: string; readOnly?: boolean }) {
  const [workflow, setWorkflow] = useState<Workflow>(nationalIdWorkflow);
  const node = workflow.nodes.find((n) => n.id === nodeId);
  const patchNode = (id: string, patch: Partial<JobNode> | Partial<TriggerNode>) =>
    setWorkflow((w) => ({ ...w, nodes: w.nodes.map((n) => (n.id === id ? ({ ...n, ...patch } as typeof n) : n)) }));
  const patchEdge = (id: string, patch: Partial<WorkflowEdge>) =>
    setWorkflow((w) => ({ ...w, edges: w.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  return (
    <StepInspector
      workflow={workflow}
      node={node}
      readOnly={readOnly}
      readOnlyAction={readOnly ? { label: "Edit in sandbox", onClick: () => {} } : undefined}
      url="https://app.openfn.org/i/3f2a9c1e"
      onRenameWorkflow={(name) => setWorkflow((w) => ({ ...w, name }))}
      onChangeJob={patchNode}
      onChangeTrigger={patchNode}
      onChangeEdge={patchEdge}
      onEditCode={() => {}}
      runFrom="run"
      onRunFrom={() => {}}
      onDelete={() => {}}
    />
  );
}

const meta: Meta<typeof StepInspector> = {
  title: "Workflow/StepInspector",
  component: StepInspector,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ width: 340 }} className="rounded-xl border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StepInspector>;

/** A step in a sandbox: everything can be changed. */
export const Step: Story = { render: () => <Editable nodeId={search.id} /> };

/** A step that runs when an expression is true. */
export const StepWithExpression: Story = { render: () => <Editable nodeId={create.id} /> };

/** On main: shown but read-only, with the way out. */
export const ReadOnly: Story = { render: () => <Editable nodeId={search.id} readOnly /> };

export const Trigger: Story = { render: () => <Editable nodeId={trigger.id} /> };

/** Nothing open: the workflow's settings. */
export const WorkflowSettings: Story = { render: () => <Editable /> };

/** The selected run reached this step, so it can be retried from here. */
export const RetryFromHere: Story = {
  args: { workflow: nationalIdWorkflow, node: search, runFrom: "retry", onRunFrom: () => {}, onEditCode: () => {} },
};
