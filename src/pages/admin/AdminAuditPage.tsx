import { useState } from "react";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import AuditTable from "../../components/admin/AuditTable";
import { auditEvents, auditPageSize } from "../../mock-data/admin";

/** Inventory view `admin-audit` (AuditLive.Index): /settings/audit. */
export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const events = auditEvents.slice((page - 1) * auditPageSize, page * auditPageSize);

  return (
    <PageContent header={<Header title="Audit" />}>
      <Centered>
        <AuditTable
          events={events}
          pageNumber={page}
          pageSize={auditPageSize}
          totalEntries={auditEvents.length}
          onPage={setPage}
        />
      </Centered>
    </PageContent>
  );
}
