import type { Meta, StoryObj } from "@storybook/react";
import ButtonMenu from "./ButtonMenu";
import { MenuDivider, MenuItem } from "./Menu";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof ButtonMenu> = {
  title: "Shared/ButtonMenu",
  component: ButtonMenu,
  decorators: [withRouter, (Story) => <div className="flex justify-center p-8 pb-48"><Story /></div>],
  args: {
    label: "Actions",
    children: (
      <>
        <MenuItem to="/settings/users">Edit</MenuItem>
        <MenuItem>Cancel deletion</MenuItem>
        <MenuDivider />
        <MenuItem tone="danger">Delete now</MenuItem>
      </>
    ),
  },
};
export default meta;
type Story = StoryObj<typeof ButtonMenu>;

/** A table row's Actions menu. */
export const RowActions: Story = {};

/** A primary "Add new" menu with a disabled entry. */
export const AddNew: Story = {
  args: {
    label: "Add new",
    theme: "primary",
    children: (
      <>
        <MenuItem>Credential</MenuItem>
        <MenuItem>OAuth Client</MenuItem>
        <MenuItem disabled description="Only project owners and admins can add these">
          Keychain Credential
        </MenuItem>
      </>
    ),
  },
};
