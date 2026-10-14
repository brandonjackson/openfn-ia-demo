import Pagination from "../Pagination";
import { EmptyState, Table, Td, Th, Tr } from "../Table";
import { findChannel, type ChannelRequest } from "../../mock-data/channel-requests";
import DateTime from "../DateTime";
import TextLink from "../TextLink";
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
              <Td title={r.requestId}>
                <TextLink to={`/projects/${projectId}/history/channels/${r.id}`} className="font-mono">
                  {r.requestId.slice(0, 8)}
                </TextLink>
              </Td>
              <Td className="text-gray-700">{path || "—"}</Td>
              <Td>
                <TextLink to={`/projects/${projectId}/history/channels?filters[channel_id]=${r.channelId}`}>
                  {channel?.name}
                </TextLink>
              </Td>
              <Td>
                <DateTime value={r.startedAt} />
              </Td>
              <Td>
                <ChannelStatePill state={r.state} />
              </Td>
              <Td className="max-w-xs truncate">{error}</Td>
            </Tr>
          );
        })
      )}
    </Table>
  );
}
