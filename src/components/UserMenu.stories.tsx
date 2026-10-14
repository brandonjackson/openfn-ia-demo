import type { Meta, StoryObj } from "@storybook/react";
import UserMenu from "./UserMenu";
import { currentUser, users } from "../mock-data/users";
import { withRouter } from "../stories/decorators";

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

export const Closed: Story = {};
export const Open: Story = { args: { defaultOpen: true } };
export const ExperimentalFeaturesOn: Story = { args: { defaultOpen: true, user: users[3] } };
