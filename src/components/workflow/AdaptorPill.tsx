import type { AdaptorKind } from "../../mock-data/workflow";
import { adaptorInfo } from "../../mock-data/adaptor-reference";
import { AdaptorIcon } from "./AdaptorIcon";

interface Props {
  adaptor: AdaptorKind;
  /** Also show the pinned version, e.g. "Common 2.1". */
  showVersion?: boolean;
  /** Tighter, for list rows. */
  compact?: boolean;
}

/**
 * A small bordered pill naming a step's adaptor with its icon, used in the
 * explorer, pane headers and the step settings.
 */
export default function AdaptorPill({ adaptor, showVersion = false, compact = false }: Props) {
  const info = adaptorInfo[adaptor];
  return (
    <span
      className={`inline-flex items-center rounded-md border border-gray-200 bg-white text-gray-700 ${
        compact ? "gap-1 py-px pl-0.5 pr-1.5 text-[11px]" : "gap-1.5 py-0.5 pl-1 pr-2 text-xs"
      }`}
    >
      <span className={compact ? "inline-flex [&>*]:h-4! [&>*]:w-4! [&>*]:rounded! [&>*]:text-[7px]!" : "inline-flex"}>
        <AdaptorIcon adaptor={adaptor} size="sm" />
      </span>
      {info.name}
      {showVersion && <span className="text-gray-400">{info.version}</span>}
    </span>
  );
}
