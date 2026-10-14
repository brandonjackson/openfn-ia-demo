import type { Meta, StoryObj } from "@storybook/react";
import UserForm from "./UserForm";
import { users } from "../../mock-data/users";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof UserForm> = {
  title: "Admin/UserForm",
  component: UserForm,
  decorators: [withRouter],
};
export default meta;
type Story = StoryObj<typeof UserForm>;

export const New: Story = {};
export const EditUser: Story = { args: { user: users[1] } };
export const EditSuperuser: Story = { args: { user: users[3] } };
