import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import JsonAttachment from "./JsonAttachment";
import FormField from "../primitives/FormField";
import { nationalIdTestCases } from "../../fixtures/test-cases";

const meta: Meta<typeof JsonAttachment> = {
  title: "Domain/JsonAttachment",
  component: JsonAttachment,
  parameters: { layout: "padded" },
  args: { id: "json-attachment", value: "", placeholder: '{\n  "given_name": "Amara"\n}' },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <FormField label="Input" htmlFor={args.id} hint="Paste it, or upload a .json file.">
        <JsonAttachment {...args} value={value} onChange={setValue} />
      </FormField>
    );
  },
};

export default meta;
type Story = StoryObj<typeof JsonAttachment>;

/** Nothing attached yet: type or paste into the box, or drop a file below it. */
export const Empty: Story = {};

/** An input already attached to a test case. */
export const Attached: Story = {
  args: { value: nationalIdTestCases.find((t) => t.inputBody)!.inputBody! },
};

/** Inside its field, with what's wrong with it said underneath. */
export const Invalid: Story = {
  args: { value: "{ given_name: Amara" },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <FormField label="Input" htmlFor={args.id} error="This isn't valid JSON.">
        <JsonAttachment {...args} value={value} onChange={setValue} />
      </FormField>
    );
  },
};
