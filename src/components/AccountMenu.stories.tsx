import type { Meta, StoryObj } from "@storybook/react";
import AccountMenu from "./AccountMenu";
import { withRouter } from "../stories/decorators";
import { currentOrg, currentUser } from "../mock-data/user";

const meta: Meta<typeof AccountMenu> = {
  title: "Components/AccountMenu",
  component: AccountMenu,
  decorators: [
    withRouter,
    (Story) => (
      // The menu opens upwards, so leave room above it.
      <div className="flex h-[360px] w-72 items-end">
        <div className="w-full">
          <Story />
        </div>
      </div>
    ),
  ],
  args: { user: currentUser, org: currentOrg },
};

export default meta;
type Story = StoryObj<typeof AccountMenu>;

export const Closed: Story = {};

export const Open: Story = {
  args: { defaultOpen: true },
};
