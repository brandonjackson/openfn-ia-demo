import { Search } from "lucide-react";
import type { ChannelRequest } from "../../model/history";
import DataTable, { type DataTableColumn } from "../primitives/DataTable";
import Stack from "../primitives/Stack";
import Inline from "../primitives/Inline";
import Text from "../primitives/Text";
import Badge from "../primitives/Badge";
import Button from "../primitives/Button";
import { channelTypeConfig } from "./channel-types";

interface Props {
  requests: ChannelRequest[];
  /** Says which project each request belongs to, in History across every project. */
  showProject?: boolean;
  /** Opens the run a request started or came from. */
  onOpenRun?: (request: ChannelRequest) => void;
  emptyMessage?: string;
}

/** Just the path of an address, which is what tells one request from another. */
function pathOf(endpoint: string): string {
  try {
    return new URL(endpoint).pathname;
  } catch {
    return endpoint;
  }
}

/** A request's HTTP status as a badge: green under 300, yellow under 500 (it was refused), red at 500 and up. */
function statusTone(status: number) {
  return status < 300 ? "green" : status < 500 ? "yellow" : "red";
}

/**
 * The requests a project's channels carried, newest first: when, which
 * channel and system, what was called, how it ended and how long it took,
 * with a way into the run it started or came from.
 */
export default function ChannelRequestTable({ requests, showProject = false, onOpenRun, emptyMessage = "No channel requests yet." }: Props) {
  const columns: DataTableColumn<ChannelRequest>[] = [
    { key: "at", header: "When", render: (r) => <Text tone="muted" size="xs" nowrap>{r.at}</Text> },
    {
      key: "channel",
      header: "Channel",
      render: (r) => (
        <Stack gap="none">
          <Text tone="strong" nowrap>
            {r.channelName}
          </Text>
          <Text tone="muted" size="xs" nowrap>
            {showProject ? `${r.projectName} · ${r.system}` : `${channelTypeConfig[r.channelType].label} · ${r.system}`}
          </Text>
        </Stack>
      ),
    },
    {
      key: "request",
      header: "Request",
      render: (r) => (
        <Inline>
          <Badge label={r.method} tone="gray" />
          <Text mono size="xs" nowrap>
            {pathOf(r.endpoint)}
          </Text>
        </Inline>
      ),
    },
    { key: "status", header: "Status", render: (r) => <Badge label={String(r.status)} tone={statusTone(r.status)} /> },
    { key: "duration", header: "Duration", align: "right", render: (r) => <Text tone="muted" size="xs" nowrap>{`${r.durationMs} ms`}</Text> },
    {
      key: "run",
      header: "",
      align: "right",
      render: (r) =>
        r.runId && onOpenRun ? (
          <Button size="xs" variant="secondary" icon={Search} onClick={() => onOpenRun(r)}>
            Run
          </Button>
        ) : null,
    },
  ];

  return <DataTable columns={columns} rows={requests} getRowKey={(r) => r.id} emptyMessage={emptyMessage} />;
}
