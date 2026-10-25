import type { Meta, StoryObj } from "@storybook/react";
import { Play } from "lucide-react";
import CodePaneHeader from "./CodePaneHeader";
import Button from "../Button";

const meta: Meta<typeof CodePaneHeader> = {
  title: "Workflow/CodePaneHeader",
  component: CodePaneHeader,
  decorators: [
    (Story) => (
      <div className="w-[720px] border border-gray-200 bg-white">
        <Story />
      </div>
    ),
  ],
  args: { path: ["Apply for a national ID", "Steps", "Search for duplicate citizens in Identity"] },
};

export default meta;
type Story = StoryObj<typeof CodePaneHeader>;

export const Default: Story = {};

export const WithActions: Story = {
  args: {
    actions: (
      <Button variant="secondary" size="xs" icon={Play}>
        Run from here
      </Button>
    ),
  },
};

export const WorkflowFile: Story = {
  args: { path: ["Apply for a national ID", "workflow.yaml"] },
};
