import { BookOpen, History, ListTree, SlidersHorizontal, SquareTerminal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * The editor's tray system.
 *
 * The editor has three docks around its main surface (the canvas or the
 * code): left, right and bottom. Each tray lives in one dock at a time; a
 * dock holding more than one tray shows a switcher in its header. Trays can
 * be moved to another dock from their header menu, and each editor mode
 * (Canvas, Code) remembers which docks are open and which tray each shows.
 *
 * To add a tray: add its id and definition here, then render its body in the
 * editor template's `renderTray`.
 */

export type Dock = "left" | "right" | "bottom";

export type TrayId = "steps" | "history" | "inspect" | "reference" | "run";

export type EditorMode = "canvas" | "code";

export interface TrayDefinition {
  id: TrayId;
  label: string;
  icon: LucideIcon;
  /** Where the tray sits until someone moves it. */
  defaultDock: Dock;
}

export const TRAYS: TrayDefinition[] = [
  { id: "steps", label: "Steps", icon: ListTree, defaultDock: "left" },
  { id: "history", label: "History", icon: History, defaultDock: "left" },
  { id: "inspect", label: "Settings", icon: SlidersHorizontal, defaultDock: "right" },
  { id: "reference", label: "Adaptor docs", icon: BookOpen, defaultDock: "right" },
  { id: "run", label: "Run", icon: SquareTerminal, defaultDock: "bottom" },
];

export const DOCKS: { id: Dock; label: string; shortcut: string; key: string }[] = [
  { id: "left", label: "Left panel", shortcut: "⌘B", key: "b" },
  { id: "bottom", label: "Bottom panel", shortcut: "⌘J", key: "j" },
  { id: "right", label: "Right panel", shortcut: "⌘I", key: "i" },
];

export function trayDefinition(id: TrayId): TrayDefinition {
  return TRAYS.find((t) => t.id === id)!;
}

/** Which dock each tray is in. */
export type TrayPlacement = Record<TrayId, Dock>;

/** Whether a dock is open, and the tray it shows. */
export type DockState = { open: boolean; active: TrayId };

/** Per mode, the state of each dock. */
export type TrayLayout = Record<EditorMode, Record<Dock, DockState>>;

export const defaultPlacement: TrayPlacement = Object.fromEntries(
  TRAYS.map((t) => [t.id, t.defaultDock])
) as TrayPlacement;

/**
 * On the canvas, history sits on the left (where Recent History floated) and
 * the rest open as you select a step or a run. In code, steps sit on the
 * left and the open step's settings on the right.
 */
export const defaultLayout: TrayLayout = {
  canvas: {
    left: { open: true, active: "history" },
    right: { open: false, active: "inspect" },
    bottom: { open: false, active: "run" },
  },
  code: {
    left: { open: true, active: "steps" },
    right: { open: true, active: "inspect" },
    bottom: { open: false, active: "run" },
  },
};

/** Default sizes in px: width for side docks, height for the bottom. */
export const defaultDockSizes: Record<Dock, number> = { left: 300, right: 340, bottom: 260 };

export const dockSizeLimits: Record<Dock, [number, number]> = {
  left: [200, 480],
  right: [260, 560],
  bottom: [140, 600],
};
