import type { Meta, StoryObj } from "@storybook/react";
import CodePaneHeader from "./CodePaneHeader";
import AdaptorPill from "./AdaptorPill";

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
  args: { path: ["Search for duplicate citizens in Identity"], leading: <AdaptorPill adaptor="http" showVersion compact onClick={() => {}} /> },
};

export default meta;
type Story = StoryObj<typeof CodePaneHeader>;

/** A step: its adaptor pill (which opens Config) and its name. */
export const Step: Story = {};

export const WorkflowFile: Story = {
  args: { path: ["Apply for a national ID", "workflow.yaml"], leading: undefined },
};
