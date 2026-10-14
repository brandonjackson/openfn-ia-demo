import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "react-router-dom";
import SimpleDropdown from "./SimpleDropdown";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof SimpleDropdown> = {
  title: "Shared/SimpleDropdown",
  component: SimpleDropdown,
  decorators: [withRouter, (Story) => <div className="flex justify-end p-4 pb-40 w-96"><Story /></div>],
  args: {
    label: "Actions",
    buttonTheme: "secondary",
    children: (
      <>
        <Link to="/settings/users/user-amy">Edit</Link>
        <Link to="/settings/users/user-amy/delete">Delete</Link>
      </>
    ),
  },
};
export default meta;
type Story = StoryObj<typeof SimpleDropdown>;

export const Secondary: Story = {};
export const Primary: Story = { args: { buttonTheme: "primary", label: "Options" } };
