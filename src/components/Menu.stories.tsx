import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";
import IconButton from "./IconButton";
import Menu, { MenuDivider, MenuHeader, MenuItem, MenuSection } from "./Menu";
import { withRouter } from "../stories/decorators";

const meta: Meta<typeof Menu> = {
  title: "Shared/Menu",
  component: Menu,
  decorators: [withRouter, (Story) => <div className="flex justify-center p-8 pb-64"><Story /></div>],
  args: {
    trigger: (
      <Button theme="secondary">
        Options <span className="hero-chevron-down h-4 w-4" />
      </Button>
    ),
    children: (
      <>
        <MenuItem icon="hero-pencil-square">Edit</MenuItem>
        <MenuItem icon="hero-document-duplicate">Duplicate</MenuItem>
        <MenuItem icon="hero-arrow-down-tray" disabled>
          Export
        </MenuItem>
        <MenuDivider />
        <MenuItem icon="hero-trash" tone="danger">
          Delete
        </MenuItem>
      </>
    ),
  },
};
export default meta;
type Story = StoryObj<typeof Menu>;

export const Default: Story = {};

export const IconTrigger: Story = {
  args: { trigger: <IconButton icon="hero-ellipsis-vertical" label="More actions" /> },
};

export const Choices: Story = {
  args: {
    align: "start",
    trigger: (
      <Button theme="secondary">
        Version: latest <span className="hero-chevron-down h-4 w-4" />
      </Button>
    ),
    children: (
      <>
        <MenuItem selected description="Saved 2 minutes ago">latest</MenuItem>
        <MenuItem description="Saved yesterday">v12</MenuItem>
        <MenuItem description="Saved last week">v11</MenuItem>
      </>
    ),
  },
};

export const WithSectionsAndHeader: Story = {
  args: {
    children: (
      <>
        <MenuHeader>
          <p className="text-gray-500">Signed in as</p>
          <p className="truncate font-medium text-gray-900">amy@openfn.org</p>
        </MenuHeader>
        <MenuDivider />
        <MenuSection heading="Account">
          <MenuItem icon="hero-user-circle" to="/profile">
            User Profile
          </MenuItem>
          <MenuItem icon="hero-key" to="/credentials">
            Credentials
          </MenuItem>
        </MenuSection>
        <MenuDivider />
        <MenuItem icon="hero-arrow-right-on-rectangle">Log out</MenuItem>
      </>
    ),
  },
};
