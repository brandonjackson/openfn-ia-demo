import type { ReactNode } from "react";
import AdaptorLogo from "../AdaptorLogo";

interface Props {
  /** The adaptor whose logo leads the row; or pass `icon` instead. */
  adaptor?: string;
  /** Leads the row in place of an adaptor's logo, e.g. an AI action's glyph. */
  icon?: ReactNode;
  name: string;
  description?: string;
  onSelect?: () => void;
}

/**
 * One choice in the "Connect a system" picker: a logo (or icon), the name in
 * bold and a line on what it is. The whole row is the button.
 */
export default function ConnectOptionRow({ adaptor, icon, name, description, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full min-w-0 items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      {icon ? (
        <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600">
          {icon}
        </span>
      ) : (
        <AdaptorLogo adaptor={adaptor} name={name} size="sm" />
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-gray-900">{name}</span>
        {description && <span className="block truncate text-xs text-gray-500">{description}</span>}
      </span>
    </button>
  );
}
