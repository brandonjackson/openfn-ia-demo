import type { AdaptorKind } from "../../mock-data/workflow";
import { adaptorInfo } from "../../mock-data/adaptor-reference";
import { AdaptorIcon } from "./AdaptorIcon";

interface Props {
  adaptor: AdaptorKind;
  /** Also show the pinned version, e.g. "Common 2.1". */
  showVersion?: boolean;
  /** Tighter, for list rows. */
  compact?: boolean;
  /** Makes the pill a button, e.g. to open the step's config. */
  onClick?: () => void;
  title?: string;
}

/**
 * A small bordered pill naming a step's adaptor with its icon, used in the
 * explorer, pane headers and the step settings.
 */
export default function AdaptorPill({ adaptor, showVersion = false, compact = false, onClick, title }: Props) {
  const info = adaptorInfo[adaptor];
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      title={title}
      className={`inline-flex flex-shrink-0 items-center rounded-md border border-gray-200 bg-white text-gray-700 ${
        compact ? "gap-1 py-px pl-0.5 pr-1.5 text-[11px]" : "gap-1.5 py-0.5 pl-1 pr-2 text-xs"
      } ${onClick ? "hover:border-gray-300 hover:bg-gray-50" : ""}`}
    >
      <span className={compact ? "inline-flex [&>*]:h-4! [&>*]:w-4! [&>*]:rounded! [&>*]:text-[7px]!" : "inline-flex"}>
        <AdaptorIcon adaptor={adaptor} size="sm" />
      </span>
      {info.name}
      {showVersion && <span className="text-gray-400">{info.version}</span>}
    </Tag>
  );
}
