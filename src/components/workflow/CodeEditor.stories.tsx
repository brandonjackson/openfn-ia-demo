import type { Meta, StoryObj } from "@storybook/react";
import CodeEditor from "./CodeEditor";
import { nationalIdWorkflow, type JobNode } from "../../mock-data/workflow";

const searchJob = nationalIdWorkflow.nodes.find((n) => n.id === "search") as JobNode;

const meta: Meta<typeof CodeEditor> = {
  title: "Workflow/CodeEditor",
  component: CodeEditor,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: 480 }} className="border border-gray-200">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CodeEditor>;

export const Default: Story = { args: { code: searchJob.body } };

export const ShortJob: Story = {
  args: {
    code: "// Send the applicant their new national ID\npost('https://.../notify', state => ({\n  body: state.nationalId,\n}));",
  },
};
