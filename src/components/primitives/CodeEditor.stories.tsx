import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import CodeEditor from "./CodeEditor";
import { type JobNode } from "../../model/workflow";
import { adaptorOperations } from "../../model/adaptor-reference";
import { nationalIdWorkflow } from "../../fixtures/workflow";

const searchJob = nationalIdWorkflow.nodes.find((n) => n.id === "search") as JobNode;

const meta: Meta<typeof CodeEditor> = {
  title: "Primitives/CodeEditor",
  component: CodeEditor,
  // As the workflow editor uses it, with adaptor operations coloured as calls.
  args: { calls: adaptorOperations },
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

function EditableEditor() {
  const [code, setCode] = useState(searchJob.body);
  return <CodeEditor code={code} onChange={setCode} calls={adaptorOperations} />;
}

/** Type, paste and undo as normal; Tab indents and Enter keeps the indent. */
export const Editable: Story = { render: () => <EditableEditor /> };

export const ShortJob: Story = {
  args: {
    code: "// Send the applicant their new national ID\npost('https://.../notify', state => ({\n  body: state.nationalId,\n}));",
  },
};

/** In a bordered box of its own height, as a card shows a component's file. */
export const Boxed: Story = {
  args: { code: JSON.stringify({ applicant_name: "given_name", dob: "date_of_birth" }, null, 2), frame: "box", label: "artifact.json" },
  decorators: [
    (Story) => (
      <div style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};
