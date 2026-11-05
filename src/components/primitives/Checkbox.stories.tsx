import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Checkbox from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Primitives/Checkbox",
  component: Checkbox,
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

function Controlled(props: Partial<React.ComponentProps<typeof Checkbox>>) {
  const [checked, setChecked] = useState(props.checked ?? false);
  return <Checkbox label="Send me a daily digest" {...props} checked={checked} onChange={setChecked} />;
}

export const Default: Story = { render: () => <Controlled /> };

export const WithHint: Story = {
  render: () => <Controlled hint="A summary of yesterday's runs, every morning." />,
};

export const Indeterminate: Story = {
  render: () => <Controlled label="Select all work orders" hideLabel indeterminate />,
};

export const Disabled: Story = { render: () => <Controlled disabled checked /> };
