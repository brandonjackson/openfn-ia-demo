import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface Props {
  /** The path to what's open, e.g. ["Kobo to Postgres sync", "workflow.yaml"], or just a step's name. */
  path: string[];
  /** Ahead of the path, e.g. the step's adaptor pill. */
  leading?: ReactNode;
  /** Right-aligned controls, e.g. the layout menu. */
  actions?: ReactNode;
}

/**
 * The slim row above the code: what's open (a step by its adaptor and name,
 * anything else as a path), and the actions for it. It replaces a row of file tabs, since the
 * explorer already lists everything you can open.
 */
export default function CodePaneHeader({ path, leading, actions }: Props) {
  return (
    <div className="flex h-10 flex-none items-center justify-between gap-4 border-b border-gray-100 px-4">
      <div className="flex min-w-0 items-center gap-2">
      {leading}
      <nav aria-label="Location" className="flex min-w-0 items-center gap-1 font-mono text-xs text-gray-500">
        {path.map((part, i) => (
          <span key={i} className={`flex items-center gap-1 ${i === path.length - 1 ? "min-w-[8rem] flex-shrink" : "min-w-0 flex-shrink-[2]"}`}>
            {i > 0 && <ChevronRight size={12} className="flex-shrink-0 text-gray-300" />}
            <span className={`truncate ${i === path.length - 1 ? "text-gray-900" : ""}`} title={part}>
              {part}
            </span>
          </span>
        ))}
      </nav>
      </div>
      {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
