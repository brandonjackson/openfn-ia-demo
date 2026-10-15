import { useCopy } from "../../../utils/useCopy";
import { channelProxyUrl } from "../../../utils/urls";
import { cn } from "../../../utils/cn";

/**
 * A channel's proxy URL that copies itself on click (ChannelLive.Helpers
 * .proxy_url_copy), with a clipboard icon on hover. The host and path
 * truncate from the left so the channel id stays visible. `icon` adds the
 * inbound arrow used in the channels table.
 */
export default function ProxyUrlCopy({
  channelId,
  icon = false,
  className,
}: {
  channelId: string;
  icon?: boolean;
  className?: string;
}) {
  const url = channelProxyUrl(channelId);
  const [scheme, rest] = url.includes("://") ? [url.split("://")[0] + "://", url.split("://")[1]] : ["", url];
  const { copied, copy } = useCopy(url);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Copy proxy URL"
      title={copied ? "Copied!" : "Copy proxy URL"}
      onClick={copy}
      className={cn("group flex min-w-0 cursor-pointer items-center gap-1.5 text-gray-500 hover:text-gray-700", className)}
    >
      {icon && <span className="hero-arrow-right-end-on-rectangle h-4 w-4 shrink-0 text-gray-300" />}
      <span className="flex min-w-0 font-mono text-xs">
        <span className="shrink-0">{scheme}</span>
        <span className="truncate" style={{ direction: "rtl", textAlign: "left" }}>
          {rest}
        </span>
      </span>
      <span className="hero-clipboard-document h-4 w-4 shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
