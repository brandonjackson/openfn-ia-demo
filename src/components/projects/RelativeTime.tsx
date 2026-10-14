import { formatRelative } from "./format";

/**
 * Lightning's `Common.datetime` (relative format): a timestamp in the
 * reader's local time, with the full ISO value on hover.
 */
export default function RelativeTime({ datetime, className }: { datetime: string; className?: string }) {
  return (
    <span className={className} title={new Date(datetime).toISOString()}>
      {formatRelative(datetime)}
    </span>
  );
}
