import { ChevronDown, FileJson, Play, RotateCcw } from "lucide-react";
import DropdownMenu from "../DropdownMenu";
import type { DropdownMenuItem } from "../DropdownMenu";

interface Props {
  /** A fresh run of the whole workflow. */
  onRun?: () => void;
  onRunWithCustomInput?: () => void;
  /**
   * Set while an earlier run is selected: the main action becomes retrying
   * it, from `step` when a step is open. `hint` adds a note to the tooltip,
   * e.g. that the retry runs on a newer version.
   */
  retry?: { step?: string; hint?: string };
  onRetry?: () => void;
  /** Disables everything, e.g. while a run is in progress. */
  disabled?: boolean;
  defaultOpen?: boolean;
}

/**
 * The toolbar's run control: a button that starts a run, with a menu for
 * the other ways to run (with a chosen input, or retrying the selected run).
 * While a run is selected the main action reads "Retry" instead.
 */
export default function RunMenuButton({
  onRun,
  onRunWithCustomInput,
  retry,
  onRetry,
  disabled = false,
  defaultOpen = false,
}: Props) {
  const retryLabel = retry ? (retry.step ? `Retry from ${retry.step}` : "Retry this run") : undefined;
  const items: DropdownMenuItem[] = [
    { id: "run", label: "Run", description: "Start a fresh run of the whole workflow", icon: Play },
    { id: "custom", label: "Run with custom input", description: "Choose or write the input for this run", icon: FileJson },
    ...(retry
      ? [{ id: "retry", label: retryLabel!, description: retry.hint ?? "Runs the selected run's input again", icon: RotateCcw }]
      : []),
  ];

  const select = (id: string) => {
    if (id === "run") onRun?.();
    else if (id === "custom") onRunWithCustomInput?.();
    else onRetry?.();
  };

  return (
    <div className="inline-flex h-8 items-stretch rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-800">
      <button
        type="button"
        disabled={disabled}
        onClick={retry ? onRetry : onRun}
        title={retry ? [retryLabel, retry.hint].filter(Boolean).join(". ") : "Run the workflow"}
        className="inline-flex items-center gap-1.5 rounded-l-md px-3 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {retry ? <RotateCcw size={13} className="text-gray-500" /> : <Play size={13} className="text-gray-500" />}
        {retry ? "Retry" : "Run"}
      </button>
      <DropdownMenu
        ariaLabel="Run options"
        items={items}
        onSelect={select}
        align="right"
        widthClass="w-72"
        defaultOpen={defaultOpen}
        trigger={({ open, toggle }) => (
          <button
            type="button"
            disabled={disabled}
            onClick={toggle}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="More ways to run"
            className={`inline-flex h-full items-center rounded-r-md border-l border-gray-200 px-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 ${
              open ? "bg-gray-50 text-gray-700" : ""
            }`}
          >
            <ChevronDown size={14} />
          </button>
        )}
      />
    </div>
  );
}
