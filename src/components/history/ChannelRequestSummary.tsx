import { Link } from "react-router-dom";
import type { Channel, ChannelEvent, ChannelRequest } from "../../mock-data/channel-requests";
import DateTime from "./DateTime";
import { CopyIconButton, MethodBadge, RequestPathDisplay, StatePillWithTooltip, StatusCodeDisplay } from "./ChannelRequestParts";
import { humanizeError } from "./channelHelpers";
import { formatUs } from "./format";
import type { ReactNode } from "react";

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div>
      <dt className="text-secondary-500 text-xs uppercase tracking-wide mb-1">{label}</dt>
      <dd className={className}>{children}</dd>
    </div>
  );
}

function Group({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <section className={className}>
      <h4 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3 pb-1.5 border-b border-secondary-100">
        {title}
      </h4>
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
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-6">
        <MethodBadge method={event?.requestMethod} />
        <RequestPathDisplay event={event} />
        <StatusCodeDisplay status={event?.responseStatus} />
        <StatePillWithTooltip
          state={request.state}
          tooltip={event?.errorMessage ? humanizeError(event.errorMessage) : undefined}
        />
        <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="text-secondary-500 uppercase tracking-wide">Channel</span>
            <Link
              to={`/projects/${channel.projectId}/channels/${channel.id}/edit`}
              className="text-primary-600 hover:text-primary-800"
            >
              {channel.name}
            </Link>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-secondary-500 uppercase tracking-wide">Request</span>
            <span className="text-secondary-900 font-mono">{request.id.slice(0, 8)}</span>
            <CopyIconButton value={request.id} title="Copy request ID" size={3} />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <Group title="Client">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Field label="IP" className="text-secondary-900">
              {request.clientIdentity || "—"}
            </Field>
            <Field label="Auth" className="text-secondary-900 flex items-start gap-1">
              <span className="hero-shield-check h-4 w-4 shrink-0 text-secondary-400 mt-0.5" />
              {request.clientAuth}
            </Field>
          </dl>
        </Group>
        <Group title="Destination">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Field label="URL" className="text-secondary-900 break-all font-mono text-xs">
              {channel.destinationUrl}
            </Field>
            <Field label="Auth" className="text-secondary-900 flex items-start gap-1">
              <span className="hero-key h-4 w-4 shrink-0 text-secondary-400 mt-0.5" />
              {request.destinationAuth}
            </Field>
          </dl>
        </Group>
        <Group title="Timing" className="md:col-span-2">
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Field label="Started">
              <DateTime value={request.startedAt} />
            </Field>
            <Field label="Completed">
              <DateTime value={request.completedAt} />
            </Field>
            <Field label="Latency" className="text-secondary-900 font-mono">
              {event?.latencyUs != null ? `${formatUs(event.latencyUs)} ms` : "—"}
            </Field>
          </dl>
        </Group>
      </div>
    </div>
  );
}
