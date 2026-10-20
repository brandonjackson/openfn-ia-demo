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
}

/**
 * Clickable pill with a system's logo and name. Connected systems link to
 * their page; suggested ones are dashed and start the add flow.
 */
export default function SystemPill({ name, adaptor, to, onClick, suggested = false, title }: Props) {
  const className = `inline-flex items-center gap-2 whitespace-nowrap rounded-full py-1 pl-1 pr-3 text-sm font-medium transition-colors ${
    suggested
      ? "border border-dashed border-gray-300 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      : "border border-gray-200 bg-white text-gray-800 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
  }`;

  const content = (
    <>
      <AdaptorLogo adaptor={adaptor} name={name} size="xs" />
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

  return (
    <button type="button" title={title} onClick={onClick} className={className}>
      {content}
    </button>
  );
}
