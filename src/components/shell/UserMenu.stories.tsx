import type { Meta, StoryObj } from "@storybook/react";
import UserMenu from "./UserMenu";
import { currentUser, users } from "../../mock-data/users";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof UserMenu> = {
  title: "Shell/UserMenu",
  component: UserMenu,
  decorators: [
    withRouter,
    (Story) => (
      <div className="app-logo-container h-20 w-48 flex items-center">
        <Story />
      </div>
    ),
  ],
  args: { user: currentUser },
};
export default meta;
type Story = StoryObj<typeof UserMenu>;

/** Opens the menu by clicking its trigger. */
const openMenu: Story["play"] = async ({ canvasElement }) => {
  canvasElement.querySelector<HTMLButtonElement>('[data-ui="account-trigger"]')?.click();
};

export const Closed: Story = {};
export const Open: Story = { play: openMenu };
export const ExperimentalFeaturesOn: Story = { args: { user: users[3] }, play: openMenu };
