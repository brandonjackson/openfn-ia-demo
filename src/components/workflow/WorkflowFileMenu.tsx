import {
  ArrowLeft,
  ChevronDown,
  Download,
  FileJson,
  FlaskConical,
  GitMerge,
  PenLine,
  Power,
  PowerOff,
  Settings,
  Trash2,
} from "lucide-react";
import DropdownMenu from "../DropdownMenu";
import type { DropdownMenuSection } from "../DropdownMenu";
import type { EditorMode, TrayId } from "./trays";
import { TRAYS } from "./trays";

export type FileMenuAction =
  | "back"
  | "rename"
  | "settings"
  | "export"
  | "edit-in-sandbox"
  | "promote"
  | "run-custom"
  | "mode:canvas"
  | "mode:code"
  | `tray:${TrayId}`
  | "assistant"
  | "toggle-live"
  | "delete";

/**
 * The "Fn" button at the top-left of the editor and its file-style menu. It
 * takes the place of a back button: leaving the editor is its first item.
 *
 * The menu holds what you do to the workflow as a whole: rename it, open its
 * settings, export it, edit it in a sandbox (or promote the sandbox), run it
 * with custom input. Under View: switch between Canvas and Code and show or
 * hide each tray and the assistant, ticked while visible. Last, pause it or
 * go live, and delete it.
 */
export default function WorkflowFileMenu({
  projectName,
  onMain = true,
  mode = "canvas",
  visibleTrays = [],
  assistantOpen = false,
  live = true,
  onAction,
  defaultOpen = false,
}: {
  /** The workflow's project, for "Back to …". */
  projectName?: string;
  /** On main the sandbox action is "Edit in sandbox"; elsewhere "Promote to main". */
  onMain?: boolean;
  mode?: EditorMode;
  /** Trays currently on screen. */
  visibleTrays?: TrayId[];
  assistantOpen?: boolean;
  live?: boolean;
  onAction?: (action: FileMenuAction) => void;
  /** Start with the menu open (useful for stories and screenshots). */
  defaultOpen?: boolean;
}) {
  const sections: DropdownMenuSection[] = [
    { items: [{ id: "back", label: projectName ? `Back to ${projectName}` : "Back", icon: ArrowLeft }] },
    {
      items: [
        { id: "rename", label: "Rename", icon: PenLine, shortcut: "R" },
        { id: "settings", label: "Settings", icon: Settings },
        onMain
          ? { id: "edit-in-sandbox", label: "Edit in sandbox", icon: FlaskConical }
          : { id: "promote", label: "Promote to main", icon: GitMerge },
        { id: "run-custom", label: "Run with custom input", icon: FileJson },
        { id: "export", label: "Export as YAML", icon: Download },
      ],
    },
    {
      title: "View",
      items: [
        { id: "mode:canvas", label: "Canvas", checked: mode === "canvas", shortcut: "⌘E" },
        { id: "mode:code", label: "Code", checked: mode === "code", shortcut: "⌘E" },
      ],
    },
    {
      title: "Panels",
      items: [
        ...TRAYS.map((t) => ({ id: `tray:${t.id}`, label: t.label, icon: t.icon, checked: visibleTrays.includes(t.id) })),
        { id: "assistant", label: "Assistant", checked: assistantOpen, shortcut: "⌘K" },
      ],
    },
    {
      items: [
        live
          ? { id: "toggle-live", label: "Pause workflow", icon: PowerOff }
          : { id: "toggle-live", label: "Go live", icon: Power },
        { id: "delete", label: "Delete workflow", icon: Trash2, tone: "danger" },
      ],
    },
  ];

  return (
    <DropdownMenu
      ariaLabel="Workflow"
      widthClass="w-64"
      sections={sections}
      onSelect={(id) => onAction?.(id as FileMenuAction)}
      defaultOpen={defaultOpen}
      renderTrigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Workflow menu"
          className={`inline-flex h-full items-center gap-1 rounded-l-full pl-4 pr-3 text-[15px] font-bold tracking-tight text-gray-900 transition-colors hover:bg-gray-100 ${
            open ? "bg-gray-100" : ""
          }`}
        >
          Fn
          <ChevronDown size={12} className="text-gray-500" />
        </button>
      )}
    />
  );
}
