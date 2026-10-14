import { Fragment } from "react";
import { shortUuid, type AuditEvent } from "../../mock-data/admin";
import Pagination from "../Pagination";
import Pill from "../Pill";
import DateTime from "../DateTime";
import { Table, Td, Th, Tr } from "../Table";
import AuditChanges from "./AuditChanges";

function TwoLine({ label, sub }: { label: string; sub: string }) {
  return (
    <>
      <div className="truncate text-gray-900">{label}</div>
      <div className="truncate text-xs">{sub}</div>
    </>
  );
}

/**
 * The superuser audit trail (audit_live/index.html.heex): one row per event
 * (when, event pill, actor, subject) with its change strip underneath, and
 * the pagination bar.
 */
export default function AuditTable({
  events,
  pageNumber,
  pageSize,
  totalEntries,
  onPage,
}: {
  /** The events on this page. */
  events: AuditEvent[];
  pageNumber: number;
  pageSize: number;
  totalEntries: number;
  onPage?: (page: number) => void;
}) {
  return (
    <Table
      divide={false}
      header={
        <Tr>
          <Th>Occurred</Th>
          <Th>Event</Th>
          <Th>Actor</Th>
          <Th>Subject</Th>
        </Tr>
      }
      footer={<Pagination pageNumber={pageNumber} pageSize={pageSize} totalEntries={totalEntries} onPage={onPage} />}
    >
      {events.map((audit) => (
        <Fragment key={audit.id}>
          <Tr className="border-t border-gray-200">
            <Td>
              <DateTime value={audit.insertedAt} />
            </Td>
            <Td>
              <Pill color="green">{audit.event}</Pill>
            </Td>
            <Td>
              <TwoLine label={audit.actorLabel} sub={audit.actorIdentifier ?? shortUuid(audit.actorId)} />
            </Td>
            <Td>
              <TwoLine label={audit.itemType.split(".").at(-1) ?? ""} sub={shortUuid(audit.itemId)} />
            </Td>
          </Tr>
          <Tr>
            <AuditChanges audit={audit} />
          </Tr>
        </Fragment>
      ))}
    </Table>
  );
}
