import { Link } from "react-router-dom";
import type { Channel } from "../../../mock-data/channels";
import { cn } from "../../../utils/cn";
import Button from "../../Button";
import { Table, Td, Th, Tr } from "../../Table";
import Toggle from "../../Toggle";
import RelativeTime from "../RelativeTime";
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
  if (channels.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No channels found.</p>
      </div>
    );
  }
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
          <Td className="wrap-break-word max-w-[15rem]">
            <span className={cn("font-medium", channel.enabled ? "text-gray-900" : "text-gray-400")}>{channel.name}</span>
          </Td>
          <Td>
            <div className="flex items-center gap-1.5 font-mono text-sm leading-none text-gray-600">
              <span className="hero-arrow-right-start-on-rectangle h-4 w-4 shrink-0 text-gray-400" />
              <span className="wrap-break-word max-w-[20rem] translate-y-px">{channel.destinationUrl}</span>
            </div>
            <ProxyUrlCopy
              channelId={channel.id}
              className="mt-1 hover:text-gray-600"
              textClassName="text-gray-400 max-w-[16rem] group-hover/copy:text-gray-600"
              leading={<span className="hero-arrow-right-end-on-rectangle h-4 w-4 shrink-0 text-gray-300" />}
              trailing={
                <span className="hero-clipboard-document h-4 w-4 shrink-0 text-gray-300 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
              }
            />
          </Td>
          <Td className="text-gray-700">
            <Link to={logs} className="text-indigo-600 hover:text-indigo-800">
              {channel.requestCount}
            </Link>
          </Td>
          <Td className="text-gray-500 text-sm">
            <Link to={logs} className="hover:text-gray-700">
              {channel.lastActivityAt ? <RelativeTime datetime={channel.lastActivityAt} /> : <span className="italic">Never</span>}
            </Link>
          </Td>
          <Td>
            {canEdit ? (
              <span title={channel.enabled ? undefined : `${channel.name} (disabled)`}>
                <Toggle checked={channel.enabled} onChange={(v) => onToggle?.(channel.id, v)} />
              </span>
            ) : (
              <span className={cn("text-sm", channel.enabled ? "text-gray-700" : "text-gray-400")}>
                {channel.enabled ? "Enabled" : "Disabled"}
              </span>
            )}
          </Td>
          <Td className="text-right">
            <div className="flex items-center justify-end gap-2">
              {canEdit && (
                <Button theme="secondary" size="sm" onClick={() => onEdit?.(channel.id)}>
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  theme="danger"
                  size="sm"
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
