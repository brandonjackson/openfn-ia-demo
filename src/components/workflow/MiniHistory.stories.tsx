import type { Meta, StoryObj } from "@storybook/react";
import { runs, workOrders } from "../../mock-data/history";
import { withRouter } from "../../stories/decorators";
import MiniHistory from "./MiniHistory";

const history = workOrders
  .filter((w) => w.workflowId === "wf-openhie")
  .map((workOrder) => ({ workOrder, runs: runs.filter((r) => workOrder.runIds.includes(r.id)) }));

const meta: Meta<typeof MiniHistory> = {
  title: "Workflow/MiniHistory",
  component: MiniHistory,
  decorators: [withRouter, (Story) => <div className="relative h-96 bg-gray-100"><Story /></div>],
  args: {
    projectId: "4adf2644-ed4e-4f97-a24c-ab35b3cb1efa",
    workflowId: "wf-openhie",
    collapsed: true,
    onToggle: () => {},
    history,
    selectedRunId: null,
    onSelectRun: () => {},
    onDeselectRun: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof MiniHistory>;

export const Collapsed: Story = {};
export const Expanded: Story = { args: { collapsed: false } };
export const RunSelected: Story = { args: { collapsed: false, selectedRunId: "run-1" } };
export const CollapsedWithRun: Story = { args: { selectedRunId: "run-1" } };
export const Empty: Story = { args: { collapsed: false, history: [] } };
export const Panel: Story = { args: { variant: "panel", collapsed: false } };
