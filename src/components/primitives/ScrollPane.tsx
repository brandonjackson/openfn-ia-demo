import type { ReactNode } from "react";

interface Props {
  /** `wide` (the default) for dashboards and tables; `narrow` for a short column of text, such as a checklist. */
  width?: "wide" | "narrow";
  children?: ReactNode;
}

/**
 * Fills the region it's put in and scrolls on its own, on the page's grey
 * ground, with its content in a centred, padded column. For a view shown in
 * place of something else, such as a page opened inside an editor's main
 * area. Its content can lay itself out by the pane's width (`@container`).
 */
export default function ScrollPane({ width = "wide", children }: Props) {
  return (
    <div className="@container h-full overflow-y-auto bg-gray-50">
      <div className={`mx-auto ${width === "narrow" ? "max-w-2xl" : "max-w-6xl"} space-y-6 px-6 pb-10 pt-4`}>{children}</div>
    </div>
  );
}
