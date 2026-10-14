import { useState, type ReactNode } from "react";
import type { ChannelEvent, ChannelRequestState } from "../../mock-data/channel-requests";
import { cn } from "../../utils/cn";
import IconButton from "../IconButton";
import { ChannelStatePill } from "./StatePill";
import { formatBytes } from "./format";

/*
 * Building blocks of the channel request page
 * (channel_request_live/components.ex).
 */

/** A white card whose header toggles its body (`disclosure_section`). */
export function DisclosureSection({
  id,
  title,
  titleRight,
  defaultOpen = true,
  padded = true,
  children,
}: {
  id?: string;
  title: string;
  titleRight?: ReactNode;
  defaultOpen?: boolean;
  padded?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="bg-white rounded-lg shadow-sm border border-secondary-200">
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-secondary-900">{title}</h3>
          {titleRight}
        </div>
        <span
          className={cn("hero-chevron-down-mini h-5 w-5 text-secondary-400 transition-transform", !open && "rotate-180")}
        />
      </button>
      {open && <div className={cn(padded && "px-4 pb-4")}>{children}</div>}
    </div>
  );
}

/** A collapsible sub-panel inside a section (`sub_section`). */
export function SubSection({
  title,
  titleRight,
  children,
}: {
  title: string;
  titleRight?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-secondary-100">
      <button
        type="button"
        className="w-full px-4 py-2.5 flex items-center justify-between cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-secondary-500 uppercase tracking-wider">{title}</span>
          {titleRight}
        </div>
        <span
          className={cn("hero-chevron-down-mini h-4 w-4 text-secondary-400 transition-transform", !open && "rotate-180")}
        />
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

const methodColors: Record<string, string> = {
  GET: "bg-blue-100 text-blue-800",
  POST: "bg-green-100 text-green-800",
  PUT: "bg-amber-100 text-amber-800",
  PATCH: "bg-amber-100 text-amber-800",
  DELETE: "bg-red-100 text-red-800",
};

export function MethodBadge({ method }: { method: string | null | undefined }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded text-sm font-bold font-mono uppercase",
        (method && methodColors[method]) ?? "bg-secondary-100 text-secondary-800"
      )}
    >
      {method || "—"}
    </span>
  );
}

export function RequestPathDisplay({ event }: { event: ChannelEvent | undefined }) {
  return (
    <span className="font-mono text-sm break-all">
      <span className="text-secondary-900">{event?.requestPath}</span>
      {event?.requestQueryString && <span className="text-secondary-400">?{event.requestQueryString}</span>}
    </span>
  );
}

/** The status code next to the path in the summary (`status_code_display`). */
export function StatusCodeDisplay({ status }: { status: number | null | undefined }) {
  const color =
    status == null
      ? "text-secondary-400"
      : status >= 500
        ? "text-red-700 bg-red-50"
        : status >= 400
          ? "text-amber-700 bg-amber-50"
          : status >= 300
            ? "text-blue-700 bg-blue-50"
            : status >= 200
              ? "text-green-700 bg-green-50"
              : "text-secondary-400";
  return <span className={cn("font-mono text-sm font-bold px-1.5 py-0.5 rounded", color)}>{status ?? "—"}</span>;
}

/** The status code chip in the Response header (`status_code_badge`). */
export function StatusCodeBadge({ status }: { status: number }) {
  const color =
    status >= 500
      ? "bg-red-100 text-red-700"
      : status >= 400
        ? "bg-amber-100 text-amber-700"
        : status >= 300
          ? "bg-blue-100 text-blue-700"
          : status >= 200
            ? "bg-green-100 text-green-700"
            : "bg-secondary-100 text-secondary-700";
  return <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-bold", color)}>{status}</span>;
}

export function StatePillWithTooltip({ state, tooltip }: { state: ChannelRequestState; tooltip?: string }) {
  return (
    <span title={state === "timeout" ? tooltip : undefined}>
      <ChannelStatePill state={state} />
    </span>
  );
}

export function CopyIconButton({ value, title = "Copy", size = 4, className }: { value: string; title?: string; size?: 3 | 4; className?: string }) {
  return (
    <IconButton
      icon="hero-clipboard"
      label={title}
      size="sm"
      onClick={() => void navigator.clipboard?.writeText(value)}
      className={cn("copy-btn text-secondary-400 hover:text-secondary-600", size === 3 && "[&>span]:h-3 [&>span]:w-3", className)}
    />
  );
}

export function SectionSizeBadge({ size }: { size: number }) {
  return <span className="text-xs text-secondary-400 font-mono">{formatBytes(size)}</span>;
}

export function HeadersTable({ headers }: { headers: [string, string][] }) {
  return (
    <table className="w-full text-xs">
      <tbody className="divide-y divide-secondary-50">
        {headers.map(([name, value]) => (
          <tr key={name}>
            <td className="py-1.5 pr-3 text-secondary-500 font-medium whitespace-nowrap align-top w-1/3">{name}</td>
            <td
              className={cn(
                "py-1.5 font-mono break-all",
                value === "[REDACTED]" ? "italic text-secondary-400" : "text-secondary-700"
              )}
            >
              {value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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
      <div className="py-6 flex flex-col items-center text-secondary-400">
        <span className="hero-document h-6 w-6 mb-1 text-secondary-300" />
        <span className="text-xs">No body</span>
      </div>
    );
  }
  if (ct && !isText(ct)) {
    return (
      <div className="py-4 text-sm text-secondary-500">
        <span className="text-xs font-mono bg-secondary-100 px-1.5 py-0.5 rounded">{contentTypeLabel(ct)}</span>
        {size != null && <span className="ml-2">{formatBytes(size)}</span>}
        {hash && <span className="ml-2 font-mono text-xs text-secondary-400">SHA256: {hash}</span>}
      </div>
    );
  }
  if (preview == null) {
    return (
      <div className="py-4 text-sm text-secondary-500">
        Body not captured
        {size != null && <span className="text-xs text-secondary-400 ml-1">({formatBytes(size)})</span>}
      </div>
    );
  }
  return (
    <div>
      <div className="relative rounded-md bg-secondary-50 border border-secondary-200">
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          {ct && (
            <span className="text-[10px] font-mono text-secondary-400 bg-white/80 rounded px-1.5 py-0.5">
              {contentTypeLabel(ct)}
            </span>
          )}
          <CopyIconButton value={preview} title="Copy body" size={3} className="p-1 bg-white/80 rounded" />
        </div>
        <pre className="text-xs font-mono p-3 pr-20 max-h-80 overflow-auto text-secondary-700 whitespace-pre-wrap break-all">
          {preview}
        </pre>
      </div>
      {hash && (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-secondary-400">
          <span className="font-mono">SHA256: {hash.slice(0, 16)}...</span>
          <CopyIconButton value={hash} title="Copy hash" size={3} />
        </div>
      )}
      {size != null && size > preview.length && (
        <div className="mt-1 text-[11px] text-secondary-400">
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
    <div className="border-t border-secondary-100">
      <div className="flex flex-col items-center justify-center px-4 py-8 text-secondary-500">
        <span className={cn(icon, "h-8 w-8 mb-3 text-secondary-400")} />
        <p className="font-medium mb-1">{label}</p>
        <p className="text-sm mb-2">{humanMessage}</p>
        <code className="text-xs font-mono bg-secondary-100 px-2 py-1 rounded">{errorCode}</code>
      </div>
    </div>
  );
}
