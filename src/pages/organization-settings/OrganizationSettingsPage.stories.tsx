import type { Meta, StoryObj } from "@storybook/react";
import OrganizationSettingsPage from "./OrganizationSettingsPage";
import { withRouter } from "../../stories/decorators";
import type { IANode } from "../../model/ia-tree";
import { organizationSettingsData } from "../../fixtures/organization";

const root: IANode = { id: "organization-settings", label: "Organization settings", pageType: "organization-settings" };
const ancestors = [{ node: root, path: "/organization-settings" }];

const section = (id: string, label: string): IANode => ({ id, label, pageType: "organization-settings" });

const meta: Meta<typeof OrganizationSettingsPage> = {
  title: "Pages/OrganizationSettingsPage",
  component: OrganizationSettingsPage,
  args: {
    onRequestContextAccess: async () => {},
    onRemoveContextLayer: async () => {},
    onInviteMember: async () => {},
    onChangeMemberRole: async () => {},
    onRemoveMember: async () => {},
    onSaveVisibility: async () => {},
    onSaveSecurityServerManager: async () => {},
  },
  decorators: [withRouter],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof OrganizationSettingsPage>;

export const Members: Story = {
  args: { node: section("members", "Members"), ancestors, currentPath: "/organization-settings/members", data: organizationSettingsData },
};

/** A member who can't manage the organisation reads who's in it, with no invite or row actions. */
export const MembersReadOnly: Story = {
  args: {
    ...Members.args,
    onInviteMember: undefined,
    onChangeMemberRole: undefined,
    onRemoveMember: undefined,
  },
};

/** Someone invited by email who hasn't joined yet. */
export const MembersWithInvitation: Story = {
  args: {
    ...Members.args,
    data: {
      ...organizationSettingsData,
      members: [...organizationSettingsData.members, { id: "m-5", name: "new.person@example.org", email: "new.person@example.org", role: "Member", lastActive: "Invited" }],
    },
  },
};

export const Visibility: Story = {
  args: { node: section("visibility", "Visibility"), ancestors, currentPath: "/organization-settings/visibility", data: organizationSettingsData },
};

/** Without the right to change them, the defaults show but can't be picked or saved. */
export const VisibilityReadOnly: Story = { args: { ...Visibility.args, onSaveVisibility: undefined } };

export const Context: Story = {
  args: { node: section("context", "Context"), ancestors, currentPath: "/organization-settings/context", data: organizationSettingsData },
};

export const ContextPendingRequest: Story = {
  name: "Context (request awaiting approval)",
  args: {
    ...Context.args,
    data: {
      ...organizationSettingsData,
      contextLayers: [
        ...organizationSettingsData.contextLayers,
        {
          id: "layer-partner",
          name: "partner.example.org",
          host: "https://partner.example.org/context/health",
          url: "https://partner.example.org/context/health",
          status: "pending",
        },
      ],
    },
  },
};

export const NoContextLayers: Story = {
  name: "Context (empty)",
  args: { ...Context.args, data: { ...organizationSettingsData, contextLayers: [] } },
};

export const XRoad: Story = {
  name: "X-Road",
  args: { node: section("xroad", "X-Road"), ancestors, currentPath: "/organization-settings/xroad", data: organizationSettingsData },
};

export const XRoadRunByNationalOperator: Story = {
  name: "X-Road (Security Server run by the national operator)",
  args: {
    ...XRoad.args,
    data: { ...organizationSettingsData, xroad: { ...organizationSettingsData.xroad!, managedBy: "national-operator" } },
  },
};

/** With the X-Road, Connected systems and Service catalog flags off: no X-Road section, and only projects have a visibility default. */
export const WithoutXRoadSystemsOrServices: Story = {
  name: "Visibility (no X-Road, systems or services)",
  args: {
    node: section("visibility", "Visibility"),
    ancestors,
    currentPath: "/organization-settings/visibility",
    data: { ...organizationSettingsData, xroad: undefined, visibility: { projects: organizationSettingsData.visibility.projects } },
  },
};

export const Billing: Story = {
  args: { node: section("billing", "Billing"), ancestors, currentPath: "/organization-settings/billing", data: organizationSettingsData },
};
