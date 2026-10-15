import type { ChannelEvent } from "../../types/channels";
import { cn } from "../../utils/cn";
import Card from "../Card";
import { DetailItem, DetailList } from "../DetailList";
import Pill, { type PillColor } from "../Pill";
import { formatBytes } from "../../utils/format";
import CopyButton from "../CopyButton";
import { EmptyState } from "../Table";

/*
 * Building blocks of the channel request page
 * (channel_request_live/components.ex).
 */

const methodColors: Record<string, PillColor> = {
  GET: "blue",
  POST: "green",
  PUT: "yellow",
  PATCH: "yellow",
  DELETE: "red",
};

export function MethodBadge({ method }: { method: string | null | undefined }) {
  return (
    <Pill square mono color={(method && methodColors[method]) || "gray"} className="font-bold uppercase">
      {method || "—"}
    </Pill>
  );
}

export function RequestPathDisplay({ event }: { event: ChannelEvent | undefined }) {
  return (
    <span className="break-all font-mono text-sm text-gray-900">
      {event?.requestPath}
      {event?.requestQueryString && <span className="text-gray-400">?{event.requestQueryString}</span>}
    </span>
  );
}

function statusColor(status: number | null | undefined): PillColor {
  if (status == null || status < 200) return "gray";
  if (status >= 500) return "red";
  if (status >= 400) return "yellow";
  if (status >= 300) return "blue";
  return "green";
}

/** An HTTP status code chip, coloured by class (`status_code_display`, `status_code_badge`). */
export function StatusCodeBadge({ status }: { status: number | null | undefined }) {
  return (
    <Pill square mono color={statusColor(status)} className="font-bold">
      {status ?? "—"}
    </Pill>
  );
}

export function SectionSizeBadge({ size }: { size: number }) {
  return <span className="font-mono text-xs text-gray-400">{formatBytes(size)}</span>;
}

export function HeadersTable({ headers }: { headers: [string, string][] }) {
  return (
    <DetailList className="text-xs">
      {headers.map(([name, value]) => (
        <DetailItem key={name} label={name} mono>
          <span className={cn("break-all", value === "[REDACTED]" && "italic text-gray-400")}>{value}</span>
        </DetailItem>
      ))}
    </DetailList>
  );
}

function contentTypeOf(headers: [string, string][] | null) {
  return headers?.find(([n]) => n.toLowerCase() === "content-type")?.[1] ?? null;
}

function contentTypeLabel(ct: string) {
  if (ct.includes("json")) return "JSON";
  if (ct.includes("xml")) return "XML";
  if (ct.includes("html")) return "HTML";
  if (ct.includes("text/")) return "TEXT";
  return ct;
}

const isText = (ct: string) => ["text/", "json", "xml", "javascript", "html"].some((t) => ct.includes(t));

/** A request or response body preview (`body_viewer`). */
export function BodyViewer({
  preview,
  hash,
  size,
  headers,
}: {
  preview: string | null;
  hash: string | null;
  size: number | null;
  headers: [string, string][] | null;
}) {
  const ct = contentTypeOf(headers);
  if (size === 0 && !preview) {
    return (
      <EmptyState variant="plain" icon="hero-document" message="No body" />
    );
  }
  if (ct && !isText(ct)) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
        <Pill square mono>
          {contentTypeLabel(ct)}
        </Pill>
        {size != null && <span>{formatBytes(size)}</span>}
        {hash && <span className="font-mono text-xs text-gray-400">SHA256: {hash}</span>}
      </div>
    );
  }
  if (preview == null) {
    return (
      <div className="py-4 text-sm text-gray-500">
        Body not captured
        {size != null && <span className="ml-1 text-xs text-gray-400">({formatBytes(size)})</span>}
      </div>
    );
  }
  return (
    <div className="space-y-1 text-xs text-gray-400">
      <Card muted padding="none" className="relative">
        <div className="absolute right-2 top-2 flex items-center gap-1.5">
          {ct && (
            <Pill square mono>
              {contentTypeLabel(ct)}
            </Pill>
          )}
          <CopyButton value={preview} label="Copy body" size="sm" className="bg-white/80" />
        </div>
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all p-3 pr-20 font-mono text-gray-700">{preview}</pre>
      </Card>
      {hash && (
        <div className="flex items-center gap-2 pt-1">
          <span className="font-mono">SHA256: {hash.slice(0, 16)}...</span>
          <CopyButton value={hash} label="Copy hash" size="sm" />
        </div>
      )}
      {size != null && size > preview.length && (
        <div>
          Preview: {formatBytes(preview.length)} of {formatBytes(size)}
        </div>
      )}
    </div>
  );
}

/** The Response section's placeholder when no response came back (`response_empty`). */
export function ResponseEmpty({
  type,
  errorCode,
  humanMessage,
}: {
  type: "transport" | "credential";
  errorCode: string;
  humanMessage: string;
}) {
  const [icon, label] =
    type === "transport"
      ? ["hero-exclamation-triangle", "No response received"]
      : ["hero-lock-closed", "Request not sent — credential error"];
  return (
    <EmptyState variant="plain" icon={icon} title={label} message={humanMessage} className="border-t border-gray-100">
      <Pill square mono>
        {errorCode}
      </Pill>
    </EmptyState>
  );
}
