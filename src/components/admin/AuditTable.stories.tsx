import type { Meta, StoryObj } from "@storybook/react";
import AuditTable from "./AuditTable";
import { auditEvents, auditPageSize } from "../../mock-data/admin";

const meta: Meta<typeof AuditTable> = {
  title: "Admin/AuditTable",
  component: AuditTable,
  args: {
    events: auditEvents.slice(0, auditPageSize),
    pageNumber: 1,
    pageSize: auditPageSize,
    totalEntries: auditEvents.length,
  },
};
export default meta;
type Story = StoryObj<typeof AuditTable>;

export const FirstPage: Story = {};
export const LastPage: Story = {
  args: { events: auditEvents.slice(auditPageSize), pageNumber: 2 },
};
export const Empty: Story = { args: { events: [], totalEntries: 0 } };
