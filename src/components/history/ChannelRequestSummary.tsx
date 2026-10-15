import type { ReactNode } from "react";
import type { Channel, ChannelEvent, ChannelRequest } from "../../types/channels";
import Card from "../Card";
import DateTime from "../DateTime";
import { DetailItem, DetailList } from "../DetailList";
import Heading from "../Heading";
import TextLink from "../TextLink";
import { MethodBadge, RequestPathDisplay, StatusCodeBadge } from "./ChannelRequestParts";
import { ChannelStatePill } from "./StatePill";
import { humanizeError } from "./channelHelpers";
import { formatUs, shortUuid } from "../../utils/format";
import CopyButton from "../CopyButton";

function Group({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <section className={className}>
      <Heading size="eyebrow" as="h4" className="mb-3 border-b border-gray-100 pb-1.5">
        {title}
      </Heading>
      {children}
    </section>
  );
}

/**
 * The channel request page's summary card (channel_request_live/show.ex
 * `summary_card`): method, path, status code and state, the channel and
 * request id, then Client, Destination and Timing facts.
 */
export default function ChannelRequestSummary({
  request,
  event,
  channel,
}: {
  request: ChannelRequest;
  event: ChannelEvent | undefined;
  channel: Channel;
}) {
  return (
    <Card padding="lg">
      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2">
        <MethodBadge method={event?.requestMethod} />
        <RequestPathDisplay event={event} />
        <StatusCodeBadge status={event?.responseStatus} />
        <ChannelStatePill
          state={request.state}
          title={request.state === "timeout" && event?.errorMessage ? humanizeError(event.errorMessage) : undefined}
        />
        <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5">
            <Heading size="eyebrow" as="span">
              Channel
            </Heading>
            <TextLink to={`/projects/${channel.projectId}/channels/${channel.id}/edit`}>{channel.name}</TextLink>
          </span>
          <span className="flex items-center gap-1.5">
            <Heading size="eyebrow" as="span">
              Request
            </Heading>
            <span className="font-mono text-gray-900">{shortUuid(request.id)}</span>
            <CopyButton value={request.id} label="Copy request ID" size="sm" />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
        <Group title="Client">
          <DetailList layout="grid" className="md:grid-cols-2">
            <DetailItem label="IP">{request.clientIdentity || "—"}</DetailItem>
            <DetailItem label="Auth">
              <span className="hero-shield-check mr-1 h-4 w-4 text-gray-400" />
              {request.clientAuth}
            </DetailItem>
          </DetailList>
        </Group>
        <Group title="Destination">
          <DetailList layout="grid" className="md:grid-cols-2">
            <DetailItem label="URL" mono>
              {channel.destinationUrl}
            </DetailItem>
            <DetailItem label="Auth">
              <span className="hero-key mr-1 h-4 w-4 text-gray-400" />
              {request.destinationAuth}
            </DetailItem>
          </DetailList>
        </Group>
        <Group title="Timing" className="md:col-span-2">
          <DetailList layout="grid" className="md:grid-cols-3">
            <DetailItem label="Started">
              <DateTime value={request.startedAt} />
            </DetailItem>
            <DetailItem label="Completed">
              <DateTime value={request.completedAt} />
            </DetailItem>
            <DetailItem label="Latency" mono>
              {event?.latencyUs != null ? `${formatUs(event.latencyUs)} ms` : "—"}
            </DetailItem>
          </DetailList>
        </Group>
      </div>
    </Card>
  );
}
