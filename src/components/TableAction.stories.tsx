import type { Meta, StoryObj } from "@storybook/react";
import TableAction from "./TableAction";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof TableAction> = {
  title: "Shared/TableAction",
  component: TableAction,
  decorators: [withRouter],
  args: { to: "/projects", children: "History" },
};
export default meta;
type Story = StoryObj<typeof TableAction>;

export const AsLink: Story = {};
export const AsButton: Story = { args: { to: undefined, children: "Delete" } };
export const Disabled: Story = { args: { disabled: true, children: "Delete" } };
