import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import EditableTitle from "./EditableTitle";

function Renamable(args: ComponentProps<typeof EditableTitle>) {
  const [value, setValue] = useState(args.value);
  return <EditableTitle {...args} value={value} onChange={setValue} />;
}

const meta: Meta<typeof EditableTitle> = {
  title: "Components/EditableTitle",
  component: EditableTitle,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="flex h-12 w-80 items-center rounded-lg border border-gray-200 bg-white px-4">
        <Story />
      </div>
    ),
  ],
  args: { value: "Create new citizen in Identity", label: "Step name" },
};

export default meta;
type Story = StoryObj<typeof EditableTitle>;

/** Hover shows the pencil; click to rename, Enter or blur to keep it, Escape to cancel. */
export const Default: Story = { render: (args) => <Renamable {...args} /> };

/** On main nothing can be renamed: plain text. */
export const ReadOnly: Story = { args: { readOnly: true, onChange: () => {} } };
