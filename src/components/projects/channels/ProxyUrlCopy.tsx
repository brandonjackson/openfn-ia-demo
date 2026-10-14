import { useState, type ReactNode } from "react";
import { channelProxyUrl } from "../../../mock-data/channels";
import { cn } from "../../../utils/cn";

/**
 * A channel's proxy URL that copies itself on click (ChannelLive.Helpers
 * .proxy_url_copy). The host and path truncate from the left so the channel
 * id stays visible.
 */
export default function ProxyUrlCopy({
  channelId,
  className,
  textClassName,
  leading,
  trailing,
}: {
  channelId: string;
  className?: string;
  textClassName?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  const url = channelProxyUrl(channelId);
  const [scheme, rest] = url.includes("://") ? [url.split("://")[0] + "://", url.split("://")[1]] : ["", url];
  const [copied, setCopied] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Copy proxy URL"
      title={copied ? "Copied!" : "Copy proxy URL"}
      onClick={() => {
        navigator.clipboard?.writeText(url).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={cn("group/copy flex items-center gap-1.5 leading-none cursor-pointer", className)}
    >
      {leading}
      <span className={cn("flex min-w-0 font-mono text-xs translate-y-px", textClassName)}>
        <span className="shrink-0">{scheme}</span>
        <span className="truncate" style={{ direction: "rtl", textAlign: "left" }}>
          {rest}
        </span>
      </span>
      {trailing}
      <span className="sr-only">Copy proxy URL</span>
    </div>
  );
}
