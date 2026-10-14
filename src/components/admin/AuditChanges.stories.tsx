import type { Meta, StoryObj } from "@storybook/react";
import AuditChanges from "./AuditChanges";
import { auditEvents } from "../../mock-data/admin";

const meta: Meta<typeof AuditChanges> = {
  title: "Admin/AuditChanges",
  component: AuditChanges,
  decorators: [
    (Story) => (
      <table className="min-w-full bg-white">
        <tbody>
          <tr>
            <Story />
          </tr>
        </tbody>
      </table>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AuditChanges>;

const byId = (id: string) => auditEvents.find((e) => e.id === id)!;

export const NewValueOnly: Story = { args: { audit: byId("audit-01") } };
export const ChangedWithCredentialBody: Story = { args: { audit: byId("audit-03") } };
export const NoChanges: Story = { args: { audit: byId("audit-05") } };
export const ManyFields: Story = { args: { audit: byId("audit-14") } };
