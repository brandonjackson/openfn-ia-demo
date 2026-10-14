import type { Meta, StoryObj } from "@storybook/react";
import { findWorkflowGraph } from "../../mock-data/workflow";
import { withRouter } from "../../stories/decorators";
import WorkflowSettings from "./WorkflowSettings";

const noop = () => {};
const meta: Meta<typeof WorkflowSettings> = {
  title: "Workflow/WorkflowSettings",
  component: WorkflowSettings,
  decorators: [withRouter, (Story) => <div className="bg-gray-100 h-[800px] flex justify-end"><Story /></div>],
  args: {
    graph: findWorkflowGraph("wf-openhie")!,
    projectConcurrency: null,
    projectId: "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa",
    onChange: noop,
    onViewAsYAML: noop,
    onReset: noop,
    onClose: noop,
  },
};
export default meta;
type Story = StoryObj<typeof WorkflowSettings>;

export const Default: Story = {};
export const ProjectConcurrencyDisabled: Story = { args: { graph: findWorkflowGraph("wf-referrals")!, projectConcurrency: 1 } };
