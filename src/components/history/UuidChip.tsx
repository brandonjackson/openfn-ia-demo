import { Link } from "react-router-dom";
import { shortId, uuidOf } from "../../mock-data/history-extra";
import { cn } from "../../utils/cn";

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
      <Link to={to} title={tooltip ?? uuid} className="link-uuid">
        {shortId(id)}
      </Link>
    );
  }
  return (
    <span title={tooltip ?? uuid} className={cn("link-uuid", disabled && "cursor-not-allowed")}>
      {shortId(id)}
    </span>
  );
}
