import type { Meta, StoryObj } from "@storybook/react";
import WorkflowRow from "./WorkflowRow";
import { withRouter } from "../../stories/decorators";
import { projectWorkflowItems, projects } from "../../fixtures/projects";

const [planning, decisions] = projectWorkflowItems(projects[0]);
const chwWorkflows = projectWorkflowItems(projects[2]);

const meta: Meta<typeof WorkflowRow> = {
  title: "Domain/WorkflowRow",
  component: WorkflowRow,
  args: { onToggleEnabled: () => {}, onDelete: () => {} },
  decorators: [
    withRouter,
    (Story) => (
      <div className="max-w-5xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WorkflowRow>;

/** Backs a live service; its latest run failed; seven people edit it. */
export const Default: Story = {
  args: { workflow: planning },
};

export const DraftService: Story = {
  args: { workflow: decisions },
};

export const Running: Story = {
  args: { workflow: chwWorkflows.find((w) => w.latestRun === "running")! },
};

/** Its trigger is off, so it only runs when someone starts it by hand. */
export const Disabled: Story = {
  args: { workflow: chwWorkflows.find((w) => !w.enabled && w.latestRun)! },
};

export const NeverRun: Story = {
  args: { workflow: chwWorkflows.find((w) => !w.latestRun)! },
};

/** Without the callbacks there's no switch or menu, e.g. for a viewer. */
export const ReadOnly: Story = {
  args: { workflow: planning, onToggleEnabled: undefined, onDelete: undefined },
};
