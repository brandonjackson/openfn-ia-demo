import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import AdaptorLogo from "./AdaptorLogo";

interface Props {
  name: string;
  /** Adaptor id used to look up the logo. */
  adaptor?: string;
  /** Link target for a connected system. */
  to?: string;
  /** Click handler, e.g. to start adding a suggested system. */
  onClick?: () => void;
  /** Dashed "+" pill for a system that isn't connected yet. */
  suggested?: boolean;
  /** Tooltip, e.g. the system's description. */
  title?: string;
  /** `sm` for tight spots like cards; `md` (default) for rows of pills. */
  size?: "sm" | "md";
}

/**
 * Pill with a system's logo and name. Connected systems link to their page;
 * suggested ones are dashed and start the add flow. Without `to` or
 * `onClick` it's a static label (e.g. inside a clickable card).
 */
export default function SystemPill({
  name,
  adaptor,
  to,
  onClick,
  suggested = false,
  title,
  size = "md",
}: Props) {
  const interactive = Boolean(to || onClick);
  const sizing =
    size === "sm" ? "gap-1.5 py-0.5 pl-0.5 pr-2 text-xs" : "gap-2 py-1 pl-1 pr-3 text-sm";
  const hover = interactive ? "hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700" : "";
  const className = `inline-flex items-center whitespace-nowrap rounded-full font-medium transition-colors ${sizing} ${hover} ${
    suggested
      ? "border border-dashed border-gray-300 bg-white text-gray-600"
      : "border border-gray-200 bg-white text-gray-800"
  }`;

  const content = (
    <>
      <AdaptorLogo adaptor={adaptor} name={name} size={size === "sm" ? "2xs" : "xs"} />
      {name}
      {suggested && <Plus size={13} className="text-gray-400" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} title={title} className={className}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" title={title} onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <span title={title} className={className}>
      {content}
    </span>
  );
}
