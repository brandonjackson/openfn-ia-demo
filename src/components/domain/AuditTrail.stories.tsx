import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import AuditTrail from "./AuditTrail";
import { adminSettingsData, auditEvents, auditPageSize } from "../../fixtures/admin";
import { filterAuditEvents } from "../../model/admin";
import type { AuditQuery } from "../../model/page-data";

const meta: Meta<typeof AuditTrail> = {
  title: "Domain/AuditTrail",
  component: AuditTrail,
  parameters: { layout: "padded" },
  args: { page: adminSettingsData.audit, query: adminSettingsData.auditQuery, onChangeQuery: () => {} },
};

export default meta;
type Story = StoryObj<typeof AuditTrail>;

/** The first page, newest first. */
export const Default: Story = {};

/** Filters and pages work, answered from fixtures the way the server would. */
export const Interactive: Story = {
  render: function Render() {
    const [query, setQuery] = useState<AuditQuery>(adminSettingsData.auditQuery);
    const matching = filterAuditEvents(auditEvents, query);
    const start = (query.page - 1) * auditPageSize;
    return (
      <AuditTrail
        query={query}
        onChangeQuery={setQuery}
        page={{ ...adminSettingsData.audit, entries: matching.slice(start, start + auditPageSize), total: matching.length }}
      />
    );
  },
};

export const NoMatches: Story = {
  args: {
    query: { search: "nobody", event: "", itemType: "", page: 1 },
    page: { ...adminSettingsData.audit, entries: [], total: 0 },
  },
};
