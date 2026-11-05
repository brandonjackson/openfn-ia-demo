import type { ReactNode } from "react";
import Surface from "../primitives/Surface";

interface Props {
  /** The left column: what can be opened, e.g. a file explorer. Leave it out to hide the column. */
  nav?: ReactNode;
  /** The slim row above the main content, e.g. what's open and its actions. */
  header?: ReactNode;
  /** The main content, e.g. a code editor, or a page for something that isn't text. */
  children: ReactNode;
  /** The tray under the main content, e.g. a panel of views (an `EditorPanel`). */
  bottomTray?: ReactNode;
  /** The thin strip at the very bottom of the middle column, e.g. a status bar. */
  footer?: ReactNode;
  /** The tray on the right, full height beside the middle column (an `EditorTray` with `placement="right"`). */
  rightTray?: ReactNode;
}

/**
 * The code view's frame, laid out like an IDE inside one card: a nav
 * column on the left, the main content in the middle under a header row,
 * with a tray under it and a footer strip below that, and a tray on the
 * right. The trays belong here: the canvas has none.
 */
export default function CodeLayout({ nav, header, children, bottomTray, footer, rightTray }: Props) {
  return (
    <div className="h-full p-4 pt-3">
      <Surface className="flex h-full overflow-hidden">
        {nav && <div className="w-64 flex-none border-r border-gray-100">{nav}</div>}
        <div className="flex min-w-0 flex-1 flex-col">
          {header}
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
          {bottomTray}
          {footer}
        </div>
        {rightTray}
      </Surface>
    </div>
  );
}
