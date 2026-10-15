import type { Meta, StoryObj } from "@storybook/react";
import RoleSelect from "./RoleSelect";

const meta: Meta<typeof RoleSelect> = {
  title: "Project settings/RoleSelect",
  component: RoleSelect,
  args: { value: "", onChange: () => {} },
};
export default meta;
type Story = StoryObj<typeof RoleSelect>;

export const Default: Story = {};
export const Selected: Story = { args: { value: "editor" } };
