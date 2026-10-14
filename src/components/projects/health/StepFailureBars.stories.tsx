import type { Meta, StoryObj } from "@storybook/react";
import StepFailureBars from "./StepFailureBars";
import { healthFor } from "../../../mock-data/workflow-health";
import { withWhitePanel } from "../../../stories/decorators";

const meta: Meta<typeof StepFailureBars> = {
  title: "Projects/Health/StepFailureBars",
  component: StepFailureBars,
  decorators: [withWhitePanel()],
  args: { signatures: healthFor("wf-openhie", "7").signatures, emptyMessage: "No failures in the last 7 days" },
};
export default meta;
type Story = StoryObj<typeof StepFailureBars>;

export const Default: Story = {};
export const Empty: Story = { args: { signatures: [] } };
