import { useSyncExternalStore } from "react";

/**
 * The editor's layout, as in an IDE: which areas are showing and which view
 * the bottom panel is on. It's remembered across workflows and reloads, so
 * the editor opens the way you left it.
 */
export type PanelViewId = "runs" | "failures" | "log" | "input" | "output";

const panelViewIds: PanelViewId[] = ["runs", "failures", "log", "input", "output"];

/** What the right-hand column in code mode shows: the open item's config, or a step's adaptor snippets. */
export type DetailsViewId = "config" | "snippets";

export interface EditorLayout {
  /** The code explorer on the left (code mode). */
  explorer: boolean;
  /** The panel under the code: showing, or closed. The canvas has no panel; its inspector covers runs. */
  panel: boolean;
  panelView: PanelViewId;
  panelMaximized: boolean;
  /** Views taken out of the panel's tab bar. */
  hiddenViews: PanelViewId[];
  /** The details column beside the code: the open item's config or a step's snippets. */
  details: boolean;
  detailsView: DetailsViewId;
  /** The assistant on the right. */
  assistant: boolean;
  /** The run history laid over the canvas while no run is loaded; Off in the runs bar turns it off. */
  canvasActivity: boolean;
}

export const defaultLayout: EditorLayout = {
  explorer: true,
  panel: false,
  panelView: "runs",
  panelMaximized: false,
  hiddenViews: [],
  details: true,
  detailsView: "snippets",
  assistant: false,
  canvasActivity: true,
};

const STORAGE_KEY = "openfn-ia-demo:editor-layout";

function load(): EditorLayout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // The panel's size and view aren't carried over: it always opens at its smaller size on the runs tab.
    const saved = raw
      ? { ...defaultLayout, ...(JSON.parse(raw) as Partial<EditorLayout>), panelMaximized: false, panelView: defaultLayout.panelView }
      : defaultLayout;
    // Views saved under an older name, or since removed, fall back to the default.
    return {
      ...saved,
      detailsView: ["config", "snippets"].includes(saved.detailsView) ? saved.detailsView : defaultLayout.detailsView,
      hiddenViews: saved.hiddenViews.filter((v) => panelViewIds.includes(v)),
    };
  } catch {
    return defaultLayout;
  }
}

let layout: EditorLayout = load();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setLayout(patch: Partial<EditorLayout> | ((current: EditorLayout) => Partial<EditorLayout>)) {
  layout = { ...layout, ...(typeof patch === "function" ? patch(layout) : patch) };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // Storage can be unavailable; the layout still holds for this session.
  }
  listeners.forEach((l) => l());
}

export function resetLayout() {
  setLayout(defaultLayout);
}

/** The editor layout and a setter that merges a patch into it. */
export function useEditorLayout(): [EditorLayout, typeof setLayout] {
  const current = useSyncExternalStore(subscribe, () => layout);
  return [current, setLayout];
}
