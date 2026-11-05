import type { ReactNode } from "react";
import Surface from "../primitives/Surface";

interface Props {
  /** The left group, e.g. a file menu, the name and where you're working. The only part that shrinks: its contents truncate. */
  start: ReactNode;
  /** The centre group, e.g. a view switcher. */
  middle?: ReactNode;
  /** Beside the centre group, outside it, e.g. a bar for what's loaded. */
  afterMiddle?: ReactNode;
  /** The right group, e.g. run and the main action. */
  end?: ReactNode;
  /** One more group on its own at the far right, e.g. the toggle for the side column. */
  aside?: ReactNode;
  /** Folds `aside` away, taking the gap before it along, e.g. while what it opens is open. */
  asideHidden?: boolean;
}

const group = "flex h-10 items-center";

/**
 * The editor's top bar: raised groups of controls spread across the top,
 * left, centre and right, with an optional last group that folds away on the
 * same timing as `EditorShell`'s side column slides, so the bar's right edge
 * glides. The groups are slots: what goes in them is up to the editor.
 */
export default function EditorTopBar({ start, middle, afterMiddle, end, aside, asideHidden = false }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Surface className={`${group} min-w-0 pr-2`}>{start}</Surface>

      {(middle || afterMiddle) && (
        <div className="flex flex-none items-center gap-3">
          {middle && <Surface className={`${group} px-1.5`}>{middle}</Surface>}
          {afterMiddle}
        </div>
      )}

      {(end || aside) && (
        <div className="flex flex-none items-center gap-3">
          {end && <Surface className={`${group} gap-1.5 px-1.5`}>{end}</Surface>}
          {aside && (
            <div
              inert={asideHidden}
              aria-hidden={asideHidden}
              className={`flex-none overflow-hidden transition-[max-width,margin,opacity] duration-300 ease-out motion-reduce:transition-none ${
                asideHidden ? "-ml-3 max-w-0 opacity-0" : "max-w-16 opacity-100"
              }`}
            >
              <Surface className={`${group} px-1`}>{aside}</Surface>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
