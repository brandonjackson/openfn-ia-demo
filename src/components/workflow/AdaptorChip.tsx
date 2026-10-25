import type { AdaptorKind } from "../../mock-data/workflow";
import { adaptorNames, adaptorVersions } from "../../mock-data/workflow";
import AdaptorLogo from "../AdaptorLogo";

/**
 * A small bordered chip naming a step's adaptor with its logo, e.g. in the
 * steps list or the step bar. `showVersion` adds the version it runs on.
 * Given `onClick`, it's a button (e.g. to open the adaptor's docs).
 * `iconOnly` shows just the logo, naming the adaptor in its tooltip, for
 * tight lists where the step's name matters more.
 */
export default function AdaptorChip({
  adaptor,
  showVersion = false,
  onClick,
  title,
  iconOnly = false,
}: {
  adaptor: AdaptorKind;
  showVersion?: boolean;
  onClick?: () => void;
  title?: string;
  iconOnly?: boolean;
}) {
  if (iconOnly) {
    return (
      <span title={title ?? adaptorNames[adaptor]} className="inline-flex flex-shrink-0">
        <AdaptorLogo adaptor={adaptor} name={adaptorNames[adaptor]} size="2xs" />
      </span>
    );
  }
  const content = (
    <>
      <AdaptorLogo adaptor={adaptor} name={adaptorNames[adaptor]} size="2xs" />
      <span>{adaptorNames[adaptor]}</span>
      {showVersion && <span className="font-mono text-gray-400">{adaptorVersions[adaptor]}</span>}
    </>
  );
  const classes =
    "inline-flex flex-shrink-0 items-center gap-1.5 rounded-md border border-gray-200 bg-white py-0.5 pl-0.5 pr-1.5 text-[11px] text-gray-600";
  return onClick ? (
    <button type="button" onClick={onClick} title={title} className={`${classes} hover:border-gray-300 hover:text-gray-900`}>
      {content}
    </button>
  ) : (
    <span className={classes} title={title}>
      {content}
    </span>
  );
}
