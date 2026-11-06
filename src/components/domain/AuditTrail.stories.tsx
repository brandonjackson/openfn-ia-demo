import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import AuditTrail from "./AuditTrail";
import { auditEvents, auditPageSize, emptyAuditQuery, firstAuditPage } from "../../fixtures/admin";
import { filterAuditEvents } from "../../model/admin";
import type { AuditQuery } from "../../model/audit-events";

const meta: Meta<typeof AuditTrail> = {
  title: "Domain/AuditTrail",
  component: AuditTrail,
  parameters: { layout: "padded" },
  args: { page: firstAuditPage, query: emptyAuditQuery, onChangeQuery: () => {} },
};

export default meta;
type Story = StoryObj<typeof AuditTrail>;

/** The first page, newest first. */
export const Default: Story = {};

/** Filters and pages work, answered from fixtures the way the server would. */
export const Interactive: Story = {
  render: function Render() {
    const [query, setQuery] = useState<AuditQuery>(emptyAuditQuery);
    const matching = filterAuditEvents(auditEvents, query);
    const start = (query.page - 1) * auditPageSize;
    return (
      <AuditTrail
        query={query}
        onChangeQuery={setQuery}
        page={{ ...firstAuditPage, entries: matching.slice(start, start + auditPageSize), total: matching.length }}
      />
    );
  },
};

export const NoMatches: Story = {
  args: {
    query: { search: "nobody", event: "", itemType: "", page: 1 },
    page: { ...firstAuditPage, entries: [], total: 0 },
  },
};
