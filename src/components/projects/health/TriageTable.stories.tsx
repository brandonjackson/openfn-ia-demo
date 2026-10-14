import type { Meta, StoryObj } from "@storybook/react";
import TriageTable from "./TriageTable";
import { healthFor } from "../../../mock-data/workflow-health";
import { withRouter } from "../../../stories/decorators";

const meta: Meta<typeof TriageTable> = {
  title: "Projects/Health/TriageTable",
  component: TriageTable,
  decorators: [withRouter, (Story) => <div className="rounded-lg bg-white p-6 shadow"><Story /></div>],
  args: {
    signatures: healthFor("wf-openhie", "7").signatures,
    emptyMessage: "No failures in the last 7 days",
    historyHref: "/",
  },
};
export default meta;
type Story = StoryObj<typeof TriageTable>;

export const Default: Story = {};
export const Empty: Story = { args: { signatures: [] } };
