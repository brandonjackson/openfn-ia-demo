import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import Modal from "../Modal";
import SearchList from "../SearchList";
import { filterPickerItems } from "./projectPickerItems";

/**
 * Generic command-palette picker. Content-agnostic: the server ships a
 * pre-flattened list of items plus display strings, and this component
 * renders the modal, handles search, keyboard navigation, and navigation.
 *
 * Used by the project picker today. The same component will back a billing
 * account picker (and any future context-scoped picker) — the only thing
 * that changes is which data the layout feeds in.
 */

export interface PickerItem {
  id: string;
  /** The leaf label shown on the row (e.g. project name). */
  label: string;
  /** Full path used for search matching (e.g. "parent/child/leaf"). */
  searchLabel: string;
  /** Indent level; 0 for top-level items. */
  depth: number;
  /** Optional accent color (sandboxes, account tiers). */
  color?: string | null;
  /** Where to navigate when selected. Pre-computed server-side. */
  href: string;
  /**
   * True when `href` targets the same section as the current URL. The
   * picker uses this to decide whether to preserve the current URL's hash
   * when navigating — it's only meaningful on same-section switches.
   */
  sameSection?: boolean;
  /**
   * Optional hero icon class for the row (e.g. `hero-credit-card`).
   * When absent, falls back to the project-style default:
   * `hero-folder` for root projects and `hero-beaker` for sandboxes.
   */
  icon?: string;
  /**
   * Whether the underlying project is structurally a sandbox (has a
   * real `parent_id` in the database). Drives the default icon
   * independently of the row's display depth, so a sandbox surfaced as
   * a user's access root still renders with the sandbox icon.
   */
  isSandbox?: boolean;
}

interface PickerProps {
  items: PickerItem[];
  currentId?: string;
  placeholder: string;
  emptyMessage: string;
  viewAllLabel: string;
  viewAllHref: string;
  /**
   * Event name the picker listens for on `document.body` to open.
   * The matching trigger button dispatches this event.
   */
  openEvent: string;
  /** Start open (stories and screenshots). */
  defaultOpen?: boolean;
}

/** The "View all" row, always first. */
const VIEW_ALL = { id: "__view_all__" } as const;
type Row = PickerItem | typeof VIEW_ALL;
const isViewAll = (row: Row): row is typeof VIEW_ALL => row === VIEW_ALL;

const iconClasses = (active: boolean) => cn("shrink-0 group-hover:text-white/70", active ? "text-white/70" : "text-gray-400");

/**
 * Lightning's command-palette picker (assets/js/picker/Picker.tsx), used as
 * the project picker. Opens on Cmd/Ctrl+P or when its trigger button
 * dispatches `openEvent`; search, arrow keys (wrapping) and Enter navigate.
 */
export default function Picker({ items: allItems, currentId, placeholder, emptyMessage, viewAllLabel, viewAllHref, openEvent, defaultOpen = false }: PickerProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchTerm, setSearchTerm] = useState("");

  const isMac = useMemo(() => typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform), []);

  const items = useMemo(() => filterPickerItems(allItems, searchTerm), [allItems, searchTerm]);

  const openPicker = useCallback(() => {
    setIsOpen(true);
    setSearchTerm("");
  }, []);

  const closePicker = useCallback(() => setIsOpen(false), []);

  // Cmd/Ctrl+P to toggle.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        if (isOpen) closePicker();
        else openPicker();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, openPicker, closePicker]);

  // Listen for the configured open event (dispatched by the trigger button).
  useEffect(() => {
    document.body.addEventListener(openEvent, openPicker);
    return () => document.body.removeEventListener(openEvent, openPicker);
  }, [openPicker, openEvent]);

  const go = (row: Row) => {
    setIsOpen(false);
    if (isViewAll(row)) navigate(viewAllHref);
    else navigate(row.href + (row.sameSection ? window.location.hash : ""));
  };

  // Modal brings the backdrop, Escape, click-outside and the focus trap;
  // the panel sits high on the page, like a command palette.
  return (
    <Modal open={isOpen} onClose={closePicker} bare className="mt-[15vh] self-start overflow-hidden">
      <SearchList<Row>
        size="lg"
        listId="picker-options"
        sections={[
          { key: "all", items: [VIEW_ALL] },
          { key: "items", items, empty: emptyMessage },
        ]}
        // The first project is highlighted on open, as in Lightning.
        initialActive={allItems[0]}
        getKey={(row) => row.id}
        isSelected={(row) => row.id === currentId}
        query={searchTerm}
        onQueryChange={setSearchTerm}
        onSelect={go}
        placeholder={placeholder}
        inputAddon={
          <kbd className="hidden items-center gap-1 rounded px-2 py-1 text-xs text-gray-400 ring-1 ring-gray-300 sm:inline-flex">
            <span>{isMac ? "⌘" : "Ctrl"}</span>
            <span>P</span>
          </kbd>
        }
        renderItem={(row, { active, selected }) =>
          isViewAll(row) ? (
            <>
              <span className={cn("hero-rectangle-stack mr-2 h-5 w-5", iconClasses(active))} />
              <span className="grow">{viewAllLabel}</span>
              <span className={cn("hero-arrow-right h-4 w-4", iconClasses(active))} />
            </>
          ) : (
            <>
              {row.depth > 0 && (
                <>
                  <span className="shrink-0" style={{ width: row.depth * 10 }} />
                  <span
                    className={cn(
                      "hero-arrow-turn-down-right mr-2 h-4 w-4 shrink-0 group-hover:text-white/50",
                      active ? "text-white/50" : "text-gray-300"
                    )}
                  />
                </>
              )}
              <span className={cn(row.icon ?? (row.isSandbox ? "hero-beaker" : "hero-folder"), "mr-2 h-5 w-5", iconClasses(active))} />
              <span className={cn("grow truncate", selected && "font-semibold")}>{row.label}</span>
              {selected && (
                <span className={cn("hero-check ml-3 h-5 w-5 shrink-0 group-hover:text-white", active ? "text-white" : "text-primary-600")} />
              )}
            </>
          )
        }
      />
    </Modal>
  );
}
