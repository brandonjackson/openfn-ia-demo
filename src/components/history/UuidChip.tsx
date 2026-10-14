import { Link } from "react-router-dom";
import { shortId, uuidOf } from "../../mock-data/history-extra";
import { cn } from "../../utils/cn";

/** Lightning's `link-uuid` utility (assets/css/app.css). */
export const linkUuidClasses =
  "cursor-pointer underline-offset-2 hover:underline hover:underline-offset-2 whitespace-nowrap inline-block text-xs font-mono p-1 rounded-md text-gray-500 bg-gray-100 hover:bg-gray-200";

/**
 * The gray monospace short-id chip used for work order and dataclip ids in
 * History. Links when `to` is set; `disabled` renders the not-allowed state
 * (e.g. an input wiped by the retention policy).
 */
export default function UuidChip({
  id,
  to,
  disabled,
  tooltip,
}: {
  /** Fixture id; shown as its 8-char short UUID. */
  id: string;
  to?: string;
  disabled?: boolean;
  tooltip?: string;
}) {
  const uuid = uuidOf(id);
  if (to && !disabled) {
    return (
      <Link to={to} className={linkUuidClasses} onClick={(e) => e.stopPropagation()}>
        <span title={tooltip ?? uuid}>{shortId(id)}</span>
      </Link>
    );
  }
  return (
    <span title={tooltip ?? uuid} className={cn(linkUuidClasses, disabled && "cursor-not-allowed")}>
      {shortId(id)}
    </span>
  );
}
