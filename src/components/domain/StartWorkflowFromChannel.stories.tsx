import type { Meta, StoryObj } from "@storybook/react";
import StartWorkflowFromChannel from "./StartWorkflowFromChannel";
import { withRouter } from "../../stories/decorators";
import { projectOptions } from "../../fixtures/projects";

const meta: Meta<typeof StartWorkflowFromChannel> = {
  title: "Domain/StartWorkflowFromChannel",
  component: StartWorkflowFromChannel,
  decorators: [
    withRouter,
    (Story) => (
      <div className="h-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StartWorkflowFromChannel>;

export const Default: Story = {
  args: { projects: projectOptions, onSelect: () => {} },
};
