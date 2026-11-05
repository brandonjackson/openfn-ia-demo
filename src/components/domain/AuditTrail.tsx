import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { AuditEvent, AuditItemType, AuditPage, AuditQuery, BadgeTone } from "../../model/page-data";
import { auditItemTypeLabels } from "../../model/admin";
import Badge from "../primitives/Badge";
import DataTable from "../primitives/DataTable";
import type { DataTableColumn } from "../primitives/DataTable";
import { Select } from "../primitives/FormControls";
import IconButton from "../primitives/IconButton";
import Inline from "../primitives/Inline";
import Pagination from "../primitives/Pagination";
import SearchInput from "../primitives/SearchInput";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import AuditChanges from "./AuditChanges";

interface Props {
  /** The page of events to show. */
  page: AuditPage;
  /** The filters and page number it was asked for. */
  query: AuditQuery;
  /** Asks for other events: new filters go back to the first page. */
  onChangeQuery: (query: AuditQuery) => void;
}

const ALL_EVENTS = "All events";
const ALL_ITEMS = "All items";
const itemTypes = Object.keys(auditItemTypeLabels) as AuditItemType[];

/** "snapshot_created" reads as "Snapshot created". */
function eventLabel(event: string): string {
  const words = event.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Additions are green, removals red, everything else a change. */
function eventTone(event: string): BadgeTone {
  if (/(^|_)(created|added|enabled|inserted)/.test(event)) return "green";
  if (/(^|_)(deleted|removed|revoked|disabled|deletion|failed)/.test(event)) return "red";
  return "indigo";
}

/**
 * The instance's audit trail: who changed what and when, newest first.
 * Filter by text, event or kind of record; open a row to see the fields it
 * changed, before and after. Pages of events come from the server.
 */
export default function AuditTrail({ page, query, onChangeQuery }: Props) {
  const [open, setOpen] = useState<string[]>([]);
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  const filter = (patch: Partial<AuditQuery>) => onChangeQuery({ ...query, ...patch, page: 1 });

  const columns: DataTableColumn<AuditEvent>[] = [
    {
      key: "expand",
      header: "",
      render: (e) => (
        <IconButton
          size="xs"
          icon={open.includes(e.id) ? ChevronDown : ChevronRight}
          label={open.includes(e.id) ? "Hide changes" : "Show changes"}
          aria-expanded={open.includes(e.id)}
          onClick={() => toggle(e.id)}
        />
      ),
    },
    { key: "occurred", header: "Occurred", render: (e) => <Text tone="muted">{e.occurredAt}</Text> },
    { key: "event", header: "Event", render: (e) => <Badge label={eventLabel(e.event)} tone={eventTone(e.event)} /> },
    {
      key: "actor",
      header: "Actor",
      render: (e) => (
        <Stack gap="none">
          <Text tone="strong">{e.actor.label}</Text>
          {e.actor.identifier && (
            <Text tone="subtle" size="xs">
              {e.actor.identifier}
            </Text>
          )}
        </Stack>
      ),
    },
    {
      key: "item",
      header: "Item",
      render: (e) => (
        <Stack gap="none">
          <Text tone="strong">
            {auditItemTypeLabels[e.itemType]}
            {e.item.name ? `: ${e.item.name}` : ""}
          </Text>
          <Text tone="subtle" size="xs" mono>
            {e.item.id}
          </Text>
        </Stack>
      ),
    },
  ];

  return (
    <Stack gap="md">
      <Inline gap="sm" wrap>
        <Stack grow>
          <SearchInput
            placeholder="Filter by actor or item"
            value={query.search}
            onChange={(e) => filter({ search: e.target.value })}
          />
        </Stack>
        {/* Each select in its own stack, so it's as wide as its options rather than the whole row. */}
        <Stack>
          <Select
            aria-label="Event"
            options={[ALL_EVENTS, ...page.eventNames.map(eventLabel)]}
            value={query.event ? eventLabel(query.event) : ALL_EVENTS}
            onChange={(e) => filter({ event: page.eventNames.find((n) => eventLabel(n) === e.target.value) ?? "" })}
          />
        </Stack>
        <Stack>
          <Select
            aria-label="Item type"
            options={[ALL_ITEMS, ...itemTypes.map((t) => auditItemTypeLabels[t])]}
            value={query.itemType ? auditItemTypeLabels[query.itemType] : ALL_ITEMS}
            onChange={(e) => filter({ itemType: itemTypes.find((t) => auditItemTypeLabels[t] === e.target.value) ?? "" })}
          />
        </Stack>
      </Inline>
      <DataTable
        columns={columns}
        rows={page.entries}
        getRowKey={(e) => e.id}
        emptyMessage="No events match these filters."
        renderDetail={(e) => (open.includes(e.id) ? <AuditChanges changes={e.changes} /> : null)}
      />
      <Pagination
        page={query.page}
        pageSize={page.pageSize}
        total={page.total}
        noun="events"
        onChange={(p) => onChangeQuery({ ...query, page: p })}
      />
    </Stack>
  );
}
