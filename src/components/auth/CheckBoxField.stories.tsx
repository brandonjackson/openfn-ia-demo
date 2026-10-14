import type { Meta, StoryObj } from "@storybook/react";
import CheckBoxField from "./CheckBoxField";

const meta: Meta<typeof CheckBoxField> = { title: "Auth/CheckBoxField", component: CheckBoxField };
export default meta;
type Story = StoryObj<typeof CheckBoxField>;

export const RememberMe: Story = {
  args: {
    id: "remember_me",
    label: "Remember me",
    children: (
      <>
        <br />
        <span className="text-xs text-secondary-500">Keep me logged in for 60 days</span>
      </>
    ),
  },
};
export const Checked: Story = { args: { id: "c", label: "Remember me", defaultChecked: true } };
