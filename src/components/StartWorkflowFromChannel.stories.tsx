import type { Meta, StoryObj } from "@storybook/react";
import StartWorkflowFromChannel from "./StartWorkflowFromChannel";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof StartWorkflowFromChannel> = {
  title: "Components/StartWorkflowFromChannel",
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
  args: { channelId: "opencrvs-birth-registered" },
};
