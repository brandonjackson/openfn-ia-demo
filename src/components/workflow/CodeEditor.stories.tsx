import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import CodeEditor from "./CodeEditor";

const meta: Meta<typeof CodeEditor> = {
  title: "Workflow/CodeEditor",
  component: CodeEditor,
  decorators: [(Story) => <div className="h-64"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof CodeEditor>;

function EditableDemo() {
  const [value, setValue] = useState("fn(state => state);\n");
  return <CodeEditor value={value} onChange={setValue} />;
}

export const Editable: Story = { render: () => <EditableDemo /> };
export const ReadOnly: Story = {
  args: { value: "get('trackedEntityInstances', {\n  ou: 'DiszpKrYNg8',\n});\n", readOnly: true },
};
