import type { Meta, StoryObj } from "@storybook/react";
import AuditChanges from "./AuditChanges";
import { auditEvents } from "../../fixtures/admin";

const meta: Meta<typeof AuditChanges> = {
  title: "Domain/AuditChanges",
  component: AuditChanges,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof AuditChanges>;

/** A workflow snapshot: two fields, before and after. */
export const Updated: Story = { args: { changes: auditEvents[0].changes } };

/** Something created: no value before. */
export const Created: Story = { args: { changes: auditEvents.find((e) => e.event === "created")!.changes } };

/** An event that records no fields, such as a token refresh. */
export const NoChanges: Story = { args: { changes: [] } };
