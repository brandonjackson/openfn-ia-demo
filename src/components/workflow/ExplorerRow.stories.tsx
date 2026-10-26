import type { Meta, StoryObj } from "@storybook/react";
import { Globe, Workflow } from "lucide-react";
import ExplorerRow from "./ExplorerRow";
import AdaptorPill from "./AdaptorPill";

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
  args: { label: "workflow.yaml", icon: Workflow, trailing: <span className="text-xs text-gray-400">settings</span> },
};

export const Trigger: Story = {
  args: { label: "Webhook trigger", icon: Globe, trailing: <span className="text-xs text-gray-400">webhook</span> },
};

export const Step: Story = {
  args: { label: "Search for duplicate citizens", trailing: <AdaptorPill adaptor="http" compact /> },
};

export const SelectedWithStatus: Story = {
  args: { label: "Create new citizen in Identity", trailing: <AdaptorPill adaptor="http" />, selected: true, status: "success" },
};

export const Failed: Story = {
  args: { label: "Create new citizen in Identity", trailing: <AdaptorPill adaptor="http" />, status: "failed" },
};
