import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import StepExplorer from "./StepExplorer";
import { buildStarterWorkflow, nationalIdWorkflow } from "../../mock-data/workflow";
import { failedRun } from "../../mock-data/runs";

const meta: Meta<typeof StepExplorer> = {
  title: "Workflow/StepExplorer",
  component: StepExplorer,
  parameters: { layout: "padded" },
  args: { workflow: nationalIdWorkflow },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }} className="rounded-xl border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
  render: function Render(args) {
    const [selected, setSelected] = useState(args.selectedId);
    return <StepExplorer {...args} selectedId={selected} onSelect={setSelected} />;
  },
};

export default meta;
type Story = StoryObj<typeof StepExplorer>;

/** On main: no "Add step". */
export const Default: Story = { args: { selectedId: "search" } };

/** In a sandbox, steps can be added. */
export const Editable: Story = { args: { selectedId: "search", onAddStep: () => {} } };

/** With a run selected, each step that ran shows its status. */
export const FollowingRun: Story = { args: { selectedId: "create", run: failedRun } };

/** Nothing open: the workflow itself is selected. */
export const WorkflowSelected: Story = {};

export const NewWorkflow: Story = {
  args: { workflow: buildStarterWorkflow({ projectName: "Project A" }), onAddStep: () => {} },
};
