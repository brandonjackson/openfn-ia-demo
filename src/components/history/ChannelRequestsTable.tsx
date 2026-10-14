import { Link } from "react-router-dom";
import Pagination from "../Pagination";
import { EmptyState, Table, Td, Th, Tr } from "../Table";
import { findChannel, type ChannelRequest } from "../../mock-data/channel-requests";
import DateTime from "./DateTime";
import { ChannelStatePill } from "./StatePill";

/** History's Channel Logs table (run_live/channel_logs_component.ex). */
export default function ChannelRequestsTable({
  requests,
  projectId,
}: {
  requests: ChannelRequest[];
  projectId: string;
}) {
  return (
    <Table
      id="channel-requests-table"
      header={
        <Tr>
          <Th>Request ID</Th>
          <Th>Request Path</Th>
          <Th>Channel Name</Th>
          <Th>Started At</Th>
          <Th>Status</Th>
          <Th>Error Message</Th>
        </Tr>
      }
      footer={<Pagination pageNumber={1} pageSize={10} totalEntries={requests.length} />}
    >
      {requests.length === 0 ? (
        <Tr>
          <Td colSpan={6}>
            <EmptyState icon="hero-inbox" message="No channel requests found." />
          </Td>
        </Tr>
      ) : (
        requests.map((r) => {
          const channel = findChannel(r.channelId);
          const path = r.events.find((e) => e.type === "destination_response")?.requestPath;
          const error = r.events.find((e) => e.type === "error")?.errorMessage;
          return (
            <Tr key={r.id} id={`request-${r.id}`}>
              <Td>
                <Link
                  to={`/projects/${projectId}/history/channels/${r.id}`}
                  className="cursor-pointer underline-offset-2 hover:underline whitespace-nowrap inline-block text-primary-400 hover:text-primary-500 font-mono"
                  title={r.requestId}
                >
                  {r.requestId.slice(0, 8)}
                </Link>
              </Td>
              <Td className="text-sm text-gray-700">{path || "—"}</Td>
              <Td className="text-sm text-gray-700">
                <Link
                  to={`/projects/${projectId}/history/channels?filters[channel_id]=${r.channelId}`}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  {channel?.name}
                </Link>
              </Td>
              <Td className="text-sm text-gray-500">
                <DateTime value={r.startedAt} />
              </Td>
              <Td>
                <ChannelStatePill state={r.state} />
              </Td>
              <Td className="text-sm text-gray-500 max-w-xs truncate">{error}</Td>
            </Tr>
          );
        })
      )}
    </Table>
  );
}
