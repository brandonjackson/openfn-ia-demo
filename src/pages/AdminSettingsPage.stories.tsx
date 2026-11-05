import type { Meta, StoryObj } from "@storybook/react";
import AdminSettingsPage from "./AdminSettingsPage";
import { withRouter } from "../stories/decorators";
import type { IANode } from "../model/ia-tree";
import { adminSettingsData, auditEvents } from "../fixtures/admin";
import { filterAuditEvents } from "../model/admin";

const root: IANode = { id: "admin-settings", label: "Admin settings", pageType: "admin-settings" };
const ancestors = [{ node: root, path: "/admin-settings" }];

const section = (id: string, label: string) => ({
  node: { id, label, pageType: "admin-settings" } as IANode,
  ancestors,
  currentPath: `/admin-settings/${id}`,
});

const meta: Meta<typeof AdminSettingsPage> = {
  title: "Pages/AdminSettingsPage",
  component: AdminSettingsPage,
  decorators: [withRouter],
  parameters: { layout: "padded" },
  args: {
    data: adminSettingsData,
    onCreateUser: async () => {},
    onUpdateUser: async () => {},
    onSetUserDisabled: async () => {},
    onScheduleUserDeletion: async () => {},
    onCancelUserDeletion: async () => {},
    onDeleteUserNow: async () => {},
    onCreateProject: async () => {},
    onUpdateProject: async () => {},
    onScheduleProjectDeletion: async () => {},
    onCancelProjectDeletion: async () => {},
    onDeleteProjectNow: async () => {},
    onChangeAuditQuery: () => {},
    onTestAuthProvider: async () => {},
    onSaveAuthProvider: async () => {},
    onRemoveAuthProvider: async () => {},
    onDeleteCollection: async () => {},
    onRunMaintenance: () => new Promise((resolve) => setTimeout(resolve, 1500)),
  },
};

export default meta;
type Story = StoryObj<typeof AdminSettingsPage>;

export const Users: Story = { args: section("users", "Users") };

export const Projects: Story = { args: section("projects", "Projects") };

export const AuditTrail: Story = { name: "Audit trail", args: section("audit-trail", "Audit trail") };

const credentialQuery = { search: "", event: "", itemType: "credential" as const, page: 1 };
const credentialEvents = filterAuditEvents(auditEvents, credentialQuery);

/** Only credential events, as the item type filter shows them. */
export const AuditTrailFiltered: Story = {
  name: "Audit trail (credentials only)",
  args: {
    ...section("audit-trail", "Audit trail"),
    data: {
      ...adminSettingsData,
      auditQuery: credentialQuery,
      audit: { ...adminSettingsData.audit, entries: credentialEvents, total: credentialEvents.length },
    },
  },
};

export const Authentication: Story = { args: section("authentication", "Authentication") };

/** No provider yet, so everyone logs in with a password, and the form starts empty. */
export const AuthenticationNotSetUp: Story = {
  name: "Authentication (no provider)",
  args: { ...section("authentication", "Authentication"), data: { ...adminSettingsData, authProvider: undefined } },
};

/** A test that couldn't find an OpenID configuration at the discovery URL. */
export const AuthenticationTestFailed: Story = {
  name: "Authentication (test failed)",
  args: {
    ...section("authentication", "Authentication"),
    data: {
      ...adminSettingsData,
      authTest: {
        discoveryUrl: adminSettingsData.authProvider!.discoveryUrl,
        ok: false,
        message: "No OpenID configuration at that URL. Check it's HTTPS and ends in .well-known/openid-configuration.",
      },
    },
  },
};

export const Collections: Story = { args: section("collections", "Collections") };

export const Maintenance: Story = { args: section("maintenance", "Maintenance") };

/** With anonymous usage metrics turned off, the page asks for them back. */
export const MaintenanceMetricsOff: Story = {
  name: "Maintenance (usage metrics off)",
  args: { ...section("maintenance", "Maintenance"), data: { ...adminSettingsData, usageMetricsEnabled: false } },
};
