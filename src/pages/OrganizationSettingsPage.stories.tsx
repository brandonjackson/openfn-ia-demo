import type { Meta, StoryObj } from "@storybook/react";
import OrganizationSettingsPage from "./OrganizationSettingsPage";
import { withRouter } from "../stories/decorators";
import type { IANode } from "../model/ia-tree";
import { organizationSettingsData } from "../fixtures/organization";

const root: IANode = { id: "organization-settings", label: "Organization settings", pageType: "organization-settings" };
const ancestors = [{ node: root, path: "/organization-settings" }];

const section = (id: string, label: string): IANode => ({ id, label, pageType: "organization-settings" });

const meta: Meta<typeof OrganizationSettingsPage> = {
  title: "Pages/OrganizationSettingsPage",
  component: OrganizationSettingsPage,
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof OrganizationSettingsPage>;

export const Members: Story = {
  args: { node: section("members", "Members"), ancestors, currentPath: "/organization-settings/members", data: organizationSettingsData },
};

export const Visibility: Story = {
  args: { node: section("visibility", "Visibility"), ancestors, currentPath: "/organization-settings/visibility", data: organizationSettingsData },
};

export const XRoad: Story = {
  name: "X-Road",
  args: { node: section("xroad", "X-Road"), ancestors, currentPath: "/organization-settings/xroad", data: organizationSettingsData },
};

export const XRoadRunByNationalOperator: Story = {
  name: "X-Road (Security Server run by the national operator)",
  args: {
    ...XRoad.args,
    data: { ...organizationSettingsData, xroad: { ...organizationSettingsData.xroad, managedBy: "national-operator" } },
  },
};
