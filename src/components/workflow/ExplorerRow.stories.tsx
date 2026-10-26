import type { Meta, StoryObj } from "@storybook/react";
import { Database, Globe, Workflow } from "lucide-react";
import ExplorerRow from "./ExplorerRow";
import { AdaptorIcon } from "./AdaptorIcon";

const meta: Meta<typeof ExplorerRow> = {
  title: "Workflow/ExplorerRow",
  component: ExplorerRow,
  decorators: [
    (Story) => (
      <div className="w-64 p-2">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ExplorerRow>;

export const WorkflowFile: Story = {
  args: { label: "workflow.yaml", icon: Workflow },
};

export const Trigger: Story = {
  args: { label: "Webhook trigger", icon: Globe },
};

export const Step: Story = {
  args: { label: "Search for duplicate citizens", leading: <AdaptorIcon adaptor="http" size="xs" /> },
};

export const SelectedWithStatus: Story = {
  args: { label: "Create new citizen in Identity", leading: <AdaptorIcon adaptor="http" size="xs" />, selected: true, status: "success" },
};

export const Failed: Story = {
  args: { label: "Create new citizen in Identity", leading: <AdaptorIcon adaptor="http" size="xs" />, status: "failed" },
};

/** A project component keeps its kind at the right. */
export const Component: Story = {
  args: { label: "District codes", icon: Database, trailing: <span className="text-xs text-gray-400">collection</span> },
};
