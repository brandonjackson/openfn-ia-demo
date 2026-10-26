import { ChevronDown, FileJson, Play, RotateCcw } from "lucide-react";
import DropdownMenu from "../DropdownMenu";
import type { DropdownMenuItem } from "../DropdownMenu";

interface Props {
  /** A fresh run of the whole workflow. */
  onRun?: () => void;
  onRunWithCustomInput?: () => void;
  /** The step in focus; the main action becomes a fresh run from it. */
  fromStep?: string;
  onRunFromStep?: () => void;
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
 * The toolbar's run control. Its main action follows what's in focus:
 * "Run" with nothing loaded, "Run from here" with a step open, "Retry" with
 * a run loaded, and "Retry from here" with both. The menu keeps the other
 * ways to run: the whole workflow, from the step, with a chosen input, or
 * retrying the loaded run.
 */
export default function RunMenuButton({
  onRun,
  onRunWithCustomInput,
  fromStep,
  onRunFromStep,
  retry,
  onRetry,
  disabled = false,
  defaultOpen = false,
}: Props) {
  const retryLabel = retry ? (retry.step ? `Retry from ${retry.step}` : "Retry this run") : undefined;
  const items: DropdownMenuItem[] = [
    { id: "run", label: "Run", description: "Start a fresh run of the whole workflow", icon: Play },
    ...(fromStep
      ? [{ id: "from-step", label: `Run from ${fromStep}`, description: "A fresh run starting at this step", icon: Play }]
      : []),
    { id: "custom", label: "Run with custom input", description: "Choose or write the input for this run", icon: FileJson },
    ...(retry
      ? [{ id: "retry", label: retryLabel!, description: retry.hint ?? "Runs the loaded run's input again", icon: RotateCcw }]
      : []),
  ];

  const select = (id: string) => {
    if (id === "run") onRun?.();
    else if (id === "from-step") onRunFromStep?.();
    else if (id === "custom") onRunWithCustomInput?.();
    else onRetry?.();
  };

  const mainLabel = retry ? (retry.step ? "Retry from here" : "Retry") : fromStep ? "Run from here" : "Run";
  const mainAction = retry ? onRetry : fromStep ? onRunFromStep : onRun;
  const mainTitle = retry ? [retryLabel, retry.hint].filter(Boolean).join(". ") : fromStep ? `Run from ${fromStep}` : "Run the workflow";

  return (
    <div className="inline-flex h-8 items-stretch rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-800">
      <button
        type="button"
        disabled={disabled}
        onClick={mainAction}
        title={mainTitle}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-l-md px-3 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {retry ? <RotateCcw size={13} className="text-gray-500" /> : <Play size={13} className="text-gray-500" />}
        {mainLabel}
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
