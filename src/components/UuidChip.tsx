import type { MouseEventHandler } from "react";
import { Link } from "react-router-dom";
import { cn } from "../utils/cn";
import { shortUuid } from "../utils/format";

/**
 * The gray monospace short-id chip for work order, run and dataclip ids.
 * Links when `to` is set; `disabled` renders the not-allowed state (e.g. an
 * input wiped by the retention policy). Hover shows the full UUID.
 */
export default function UuidChip({
  uuid,
  length = 8,
  to,
  disabled,
  tooltip,
  onClick,
}: {
  uuid: string;
  /** Characters shown: 8 in LiveView pages, 7 in the workflow editor. */
  length?: number;
  to?: string;
  disabled?: boolean;
  tooltip?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  const short = shortUuid(uuid, length);
  if (to && !disabled) {
    return (
      <Link to={to} onClick={onClick} title={tooltip ?? uuid} className="link-uuid" data-ui="uuid-chip">
        {short}
      </Link>
    );
  }
  return (
    <span title={tooltip ?? uuid} className={cn("link-uuid", disabled && "cursor-not-allowed")} data-ui="uuid-chip">
      {short}
    </span>
  );
}
