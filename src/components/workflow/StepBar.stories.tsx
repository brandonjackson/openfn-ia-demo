import type { Meta, StoryObj } from "@storybook/react";
import StepBar from "./StepBar";
import { nationalIdWorkflow } from "../../mock-data/workflow";

const search = nationalIdWorkflow.nodes.find((n) => n.id === "search");
const trigger = nationalIdWorkflow.nodes.find((n) => n.type === "trigger");

const meta: Meta<typeof StepBar> = {
  title: "Workflow/StepBar",
  component: StepBar,
  parameters: { layout: "fullscreen" },
  args: {
    workflowName: nationalIdWorkflow.name,
    node: search,
    onPrev: () => {},
    onNext: () => {},
    onSelectWorkflow: () => {},
    onOpenDocs: () => {},
    runFrom: "run",
    onRunFrom: () => {},
  },
  decorators: [
    (Story) => (
      <div className="bg-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StepBar>;

export const Default: Story = {};

/** The selected run reached this step, so it can be retried from here. */
export const Retry: Story = { args: { runFrom: "retry" } };

export const Trigger: Story = { args: { node: trigger } };

/** Nothing open: the workflow's YAML. */
export const WorkflowYaml: Story = { args: { node: undefined, onPrev: undefined } };

/** In a narrow column, labels and the outer breadcrumb give way. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
};
