import { useEffect, useState } from "react";
import { useEditorLayout, type EditorLayout, type PanelViewId } from "../../components/domain/editor-layout";

/**
 * Which of the editor's areas are showing: the explorer, the panel under the
 * code, the details column and the assistant.
 *
 * The layout is the reader's, remembered across workflows (`useEditorLayout`),
 * with two things on top:
 *
 * - `initial` pins parts of it for this visit (a story's layout, or the
 *   assistant shown for a workflow opened to build). A pinned part gives way
 *   the first time it's changed.
 * - A page in the code view's main pane (Overview, Health…) opens with the
 *   bottom and right panels hidden, so it has the room. Showing them there
 *   lasts until you leave the page and leaves the remembered layout alone,
 *   so opening a code item brings the panels back as they were.
 *
 * Ctrl/⌘ + K toggles the assistant, J the panel and, in code mode, B the
 * explorer.
 */
export function useEditorPanels({
  initial,
  onPage,
  inCode,
}: {
  /** Parts of the layout to start from, over the remembered one. */
  initial?: Partial<EditorLayout>;
  /** Whether the code view is showing a page, not code. */
  onPage: boolean;
  /** Whether the code view is showing, where the explorer is. */
  inCode: boolean;
}) {
  const [remembered, remember] = useEditorLayout();
  const [pinned, setPinned] = useState<Partial<EditorLayout>>(() => ({ ...initial }));
  const layout: EditorLayout = { ...remembered, ...pinned };

  /** Changes the remembered layout. */
  const updateLayout = (requested: Partial<EditorLayout>) => {
    // The panel always opens at its smaller size on the runs tab; it's maximised, or on another view, only on request.
    const patch = requested.panel && !layout.panel ? { panelMaximized: false, panelView: "runs" as const, ...requested } : requested;
    remember(patch);
    setPinned((p) => {
      const next = { ...p };
      for (const key of Object.keys(patch) as (keyof EditorLayout)[]) delete next[key];
      return next;
    });
  };

  const [pagePanels, setPagePanels] = useState({ panel: false, details: false });
  const shownLayout: EditorLayout = onPage ? { ...layout, ...pagePanels } : layout;

  /** Changes the layout where you are: on a page, the bottom and right panels change only for the page. */
  const changeLayout = (patch: Partial<EditorLayout>) => {
    if (!onPage) return updateLayout(patch);
    const { panel, details, ...rest } = patch;
    if (panel !== undefined || details !== undefined) setPagePanels((p) => ({ panel: panel ?? p.panel, details: details ?? p.details }));
    if (Object.keys(rest).length > 0) updateLayout(rest);
  };

  const togglePanel = () => changeLayout({ panel: !shownLayout.panel });
  const toggleAssistant = () => updateLayout({ assistant: !layout.assistant });
  const toggleExplorer = () => updateLayout({ explorer: !layout.explorer });

  // Listening afresh each render, so the toggles always act on the layout as it now is.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const key = e.key.toLowerCase();
      if (key === "k") toggleAssistant();
      else if (key === "j") togglePanel();
      else if (key === "b" && inCode) toggleExplorer();
      else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  return {
    /** The layout as remembered, with what's pinned for this visit. */
    layout,
    /** The layout as drawn: on a page, with the page's own bottom and right panels. */
    shownLayout,
    updateLayout,
    changeLayout,
    /** Shows the panel on a view, e.g. a step's log when a run is loaded. */
    showPanel: (panelView: PanelViewId) => changeLayout({ panel: true, panelView }),
    togglePanel,
    toggleAssistant,
    toggleExplorer,
    /** A page is being opened: it starts with the bottom and right panels hidden. */
    hidePagePanels: () => setPagePanels({ panel: false, details: false }),
  };
}
