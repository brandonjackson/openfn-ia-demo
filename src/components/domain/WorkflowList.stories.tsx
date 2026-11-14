import type { Meta, StoryObj } from "@storybook/react";
import WorkflowList from "./WorkflowList";
import { withRouter } from "../../stories/decorators";
import { projects } from "../../fixtures/projects";
import { projectWorkflowItems } from "../../fixtures/workflow-lookup";

const done = () => Promise.resolve();

const meta: Meta<typeof WorkflowList> = {
  title: "Domain/WorkflowList",
  component: WorkflowList,
  args: { onToggleWorkflow: done, onCopyWorkflow: done, onDeleteWorkflow: done },
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
type Story = StoryObj<typeof WorkflowList>;

/** Published services first, then live workflows, then paused ones. */
export const Default: Story = {
  args: { workflows: projectWorkflowItems(projects[0]!) },
};

/** Live and paused workflows, with nothing published: the Published services section is left out. */
export const NothingPublished: Story = {
  args: { workflows: projectWorkflowItems(projects[2]!).map((w) => ({ ...w, published: false })) },
};

/** Without the callbacks there's no switch, Make a copy or Delete, e.g. for a viewer. */
export const ReadOnly: Story = {
  args: { workflows: projectWorkflowItems(projects[0]!), onToggleWorkflow: undefined, onCopyWorkflow: undefined, onDeleteWorkflow: undefined },
};
