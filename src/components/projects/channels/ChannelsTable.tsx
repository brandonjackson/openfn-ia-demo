import type { Channel } from "../../../mock-data/channels";
import { cn } from "../../../utils/cn";
import Button from "../../Button";
import { Table, Td, Th, Tr } from "../../Table";
import Toggle from "../../Toggle";
import DateTime from "../../DateTime";
import TextLink from "../../TextLink";
import ProxyUrlCopy from "./ProxyUrlCopy";

/**
 * The channels table (ChannelLive.Index `channels_table`): name, destination
 * with the copyable proxy URL under it, request count and last activity
 * (both link to channel logs), the Enabled toggle, and Edit / Delete.
 */
export default function ChannelsTable({
  channels,
  projectId,
  canEdit = true,
  canDelete = true,
  onToggle,
  onEdit,
  onDelete,
}: {
  channels: Channel[];
  projectId: string;
  canEdit?: boolean;
  canDelete?: boolean;
  onToggle?: (id: string, enabled: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  if (channels.length === 0) return <p className="py-8 text-center text-gray-500">No channels found.</p>;
  const logs = `/projects/${projectId}/history/channels`;

  return (
    <Table
      id="channels-table"
      header={
        <Tr>
          <Th>Name</Th>
          <Th>Destination</Th>
          <Th>Requests</Th>
          <Th>Last Activity</Th>
          <Th>Enabled</Th>
          <Th>
            <span className="sr-only">Actions</span>
          </Th>
        </Tr>
      }
    >
      {channels.map((channel) => (
        <Tr key={channel.id} id={`channel-${channel.id}`}>
          <Td className={cn("max-w-60 font-medium wrap-break-word", channel.enabled ? "text-gray-900" : "text-gray-400")}>
            {channel.name}
          </Td>
          <Td className="max-w-80">
            <div className="flex items-center gap-1.5 font-mono text-gray-600">
              <span className="hero-arrow-right-start-on-rectangle h-4 w-4 shrink-0 text-gray-400" />
              <span className="wrap-break-word">{channel.destinationUrl}</span>
            </div>
            <ProxyUrlCopy channelId={channel.id} icon className="mt-1" />
          </Td>
          <Td>
            <TextLink to={logs}>{channel.requestCount}</TextLink>
          </Td>
          <Td>
            <TextLink to={logs}>
              {channel.lastActivityAt ? <DateTime value={channel.lastActivityAt} /> : <span className="italic">Never</span>}
            </TextLink>
          </Td>
          <Td>
            {canEdit ? (
              <Toggle
                checked={channel.enabled}
                onChange={(v) => onToggle?.(channel.id, v)}
                tooltip={channel.enabled ? undefined : `${channel.name} (disabled)`}
              />
            ) : (
              <span className={channel.enabled ? "text-gray-700" : "text-gray-400"}>
                {channel.enabled ? "Enabled" : "Disabled"}
              </span>
            )}
          </Td>
          <Td>
            <div className="flex justify-end gap-2">
              {canEdit && (
                <Button theme="secondary" size="xs" onClick={() => onEdit?.(channel.id)}>
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  theme="danger"
                  size="xs"
                  onClick={() => {
                    if (window.confirm(`Delete "${channel.name}"? This cannot be undone.`)) onDelete?.(channel.id);
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
          </Td>
        </Tr>
      ))}
    </Table>
  );
}
