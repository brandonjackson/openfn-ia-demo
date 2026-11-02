import { useState } from "react";
import { KeyRound } from "lucide-react";
import type { ChannelDetails, ChannelMessage } from "../../mock-data/channels";
import { channelTypeConfig } from "../../channel-types";
import Badge from "../Badge";
import Card from "../Card";
import StatTile from "../StatTile";
import BarChart from "../BarChart";
import DataTable from "../DataTable";
import CodeBlock from "../CodeBlock";
import EntityPill from "../EntityPill";
import SectionHeading from "../SectionHeading";
import TextLink from "../TextLink";

/**
 * A channel the workflow uses, opened from the code view's explorer and shown
 * in the main pane in the code's place: the system it belongs to, the
 * address it listens on (event) or calls (read, write), its traffic over the
 * last week, its recent messages, and the shape of a message. Picking a
 * message shows its body; one that started or came from a run links to it.
 * It lays itself out by its own width, so it fits beside the explorer and
 * details column.
 */
export default function ChannelView({
  name,
  description,
  channel,
  onOpenRun,
}: {
  name: string;
  description: string;
  channel: ChannelDetails;
  /** Loads the run a message started or came from. */
  onOpenRun?: (runId: string) => void;
}) {
  const type = channelTypeConfig[channel.channelType];
  const total = channel.days.reduce((sum, d) => sum + d.messages, 0);
  const errors = channel.days.reduce((sum, d) => sum + d.errors, 0);
  const errorRate = total > 0 ? `${((errors / total) * 100).toFixed(1)}%` : "–";
  const [selectedId, setSelectedId] = useState(channel.messages[0]?.id);
  const selected = channel.messages.find((m) => m.id === selectedId);
  const direction = channel.channelType === "event" ? "received" : "sent";

  return (
    <div className="@container h-full overflow-y-auto bg-gray-50">
      <div className="mx-auto max-w-6xl space-y-6 px-6 pb-10 pt-4">
        <SectionHeading title={name} description={description} />

        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <Badge label={type.label} tone={type.tone} icon={type.icon} />
            <EntityPill name={channel.system.name} adaptor={channel.system.adaptor} size="sm" />
          </div>
          <div className="mt-4 flex min-w-0 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs">
            <span className="flex-none font-semibold text-indigo-600">{channel.method}</span>
            <span className="truncate text-gray-800" title={channel.endpoint}>
              {channel.endpoint}
            </span>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
            <KeyRound size={12} className="flex-none text-gray-400" />
            {channel.auth}
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-4 @4xl:grid-cols-4">
          <StatTile label={`Messages ${direction}`} value={String(total)} detail="last 7 days" trend={channel.days.map((d) => d.messages)} />
          <StatTile label="Errors" value={String(errors)} danger={errors > 0} />
          <StatTile label="Error rate" value={errorRate} />
          <StatTile label="Median response" value={`${channel.medianMs} ms`} />
        </div>

        <Card title="Traffic" description={`Messages ${direction} each day.`}>
          <BarChart unit="messages" per="day" data={channel.days.map((d) => ({ label: d.label, tick: d.tick, value: d.messages }))} />
        </Card>

        <section>
          <SectionHeading variant="label" title="Recent messages" description="Pick one to see its body." />
          <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-5">
            <div className="@4xl:col-span-3">
              <DataTable<ChannelMessage>
                rows={channel.messages}
                getRowKey={(m) => m.id}
                selectedKey={selectedId}
                onRowClick={(m) => setSelectedId(m.id)}
                emptyMessage="No messages in the last 7 days."
                columns={[
                  { key: "at", header: "When", render: (m) => <span className="whitespace-nowrap text-xs text-gray-500">{m.at}</span> },
                  {
                    key: "status",
                    header: "Status",
                    render: (m) => <Badge label={String(m.status)} tone={m.status < 400 ? "green" : "red"} />,
                  },
                  { key: "summary", header: "Message", render: (m) => <span className="text-sm text-gray-800">{m.summary}</span> },
                  {
                    key: "duration",
                    header: "Time",
                    align: "right",
                    render: (m) => <span className="whitespace-nowrap text-xs tabular-nums text-gray-500">{m.durationMs} ms</span>,
                  },
                ]}
              />
            </div>
            <div className="space-y-2 @4xl:col-span-2">
              {selected ? (
                <>
                  <CodeBlock label={`Body, ${selected.at}`} code={selected.body} />
                  {selected.runId && onOpenRun && (
                    <TextLink variant="action" onClick={() => onOpenRun(selected.runId!)}>Load run {selected.runId}</TextLink>
                  )}
                </>
              ) : (
                <p className="py-6 text-center text-sm text-gray-400">Pick a message to see its body</p>
              )}
            </div>
          </div>
        </section>

        <section>
          <SectionHeading variant="label" title="Message shape" description={`An example of what the channel ${direction === "received" ? "receives" : "sends"}.`} />
          <CodeBlock tone="light" label="JSON" code={channel.payload} />
        </section>
      </div>
    </div>
  );
}
