import type { Meta, StoryObj } from "@storybook/react";
import AccountMenu from "./AccountMenu";
import { withRouter } from "../../stories/decorators";
import { currentInstance, currentUser } from "../../fixtures/user";
import { organizationLogo } from "../../fixtures/organization";

const meta: Meta<typeof AccountMenu> = {
  title: "Domain/AccountMenu",
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
  args: { user: currentUser, instance: currentInstance },
};

export default meta;
type Story = StoryObj<typeof AccountMenu>;

export const Closed: Story = {};

/** An organisation with a logo: the same logo as the sidebar's corner. */
export const WithLogo: Story = {
  args: { instance: { name: "Ministry of Health", initials: "MH", logo: organizationLogo } },
};

export const Open: Story = {
  args: { defaultOpen: true },
};

/** A superuser also gets Admin settings, the whole instance's. */
export const Superuser: Story = {
  args: { defaultOpen: true, showAdminSettings: true },
};

/** Without the Organizations flag there are no Organization settings. */
export const WithoutOrganizationSettings: Story = {
  args: { defaultOpen: true, showOrganizationSettings: false },
};
