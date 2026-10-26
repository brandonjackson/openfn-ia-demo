import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Download,
  FlaskConical,
  GitMerge,
  Link2,
  Pause,
  Pencil,
  Play,
  Settings,
  Trash2,
} from "lucide-react";
import DropdownMenu from "../DropdownMenu";
import type { DropdownMenuItem } from "../DropdownMenu";

export type WorkflowMenuAction =
  | "back"
  | "rename"
  | "settings"
  | "edit-in-sandbox"
  | "promote"
  | "export-yaml"
  | "copy-url"
  | "see-details"
  | "toggle-live"
  | "delete";

interface Props {
  onSelect: (action: WorkflowMenuAction) => void;
  /** Whether the editor is on main (read-only) or in a sandbox. */
  onMain?: boolean;
  /** Whether triggers currently start runs. */
  live?: boolean;
  /** The project to go back to; adds "Back to workflows" at the top. */
  projectName?: string;
  /** The URL that starts the workflow; adds "Copy webhook URL". */
  url?: string;
  /** Whether the workflow has a service listing; adds "See service listing". */
  hasDetails?: boolean;
  defaultOpen?: boolean;
}

/**
 * The Fn button at the left of the editor toolbar, which opens the workflow's
 * file menu: rename, settings, sandbox and promotion, export, the webhook URL,
 * pausing, and deleting. It also carries the way back to the project, so
 * nothing from the old back button is lost.
 */
export default function WorkflowFileMenu({
  onSelect,
  onMain = true,
  live = true,
  projectName,
  url,
  hasDetails = false,
  defaultOpen = false,
}: Props) {
  const items: DropdownMenuItem[] = [
    ...(projectName
      ? [{ id: "back", label: `Back to ${projectName}`, description: "All workflows in the project", icon: ArrowLeft }]
      : []),
    { id: "rename", label: "Rename", icon: Pencil, shortcut: "R", divider: Boolean(projectName), disabled: onMain },
    { id: "settings", label: "Settings", icon: Settings },
    onMain
      ? { id: "edit-in-sandbox", label: "Edit in sandbox", icon: FlaskConical }
      : { id: "promote", label: "Go live", description: "Promote this sandbox to main", icon: GitMerge },
    { id: "export-yaml", label: "Export as YAML", icon: Download },
    ...(url ? [{ id: "copy-url", label: "Copy webhook URL", icon: Link2 }] : []),
    ...(hasDetails ? [{ id: "see-details", label: "See service listing", icon: BookOpen }] : []),
    live
      ? { id: "toggle-live", label: "Pause workflow", description: "Stop triggers from starting runs", icon: Pause, divider: true }
      : { id: "toggle-live", label: "Resume workflow", description: "Let triggers start runs again", icon: Play, divider: true },
    { id: "delete", label: "Delete workflow", icon: Trash2, tone: "danger" },
  ];

  return (
    <DropdownMenu
      ariaLabel="Workflow menu"
      items={items}
      onSelect={(id) => onSelect(id as WorkflowMenuAction)}
      widthClass="w-64"
      defaultOpen={defaultOpen}
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Workflow menu"
          className={`inline-flex h-full items-center gap-1 rounded-l-xl px-3 text-gray-900 transition-colors ${
            open ? "bg-gray-100" : "hover:bg-gray-50"
          }`}
        >
          <span className="text-base font-bold tracking-tight">Fn</span>
          <ChevronDown size={12} className="text-gray-400" />
        </button>
      )}
    />
  );
}
