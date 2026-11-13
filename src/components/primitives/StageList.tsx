import type { ReactNode } from "react";
import { Check } from "lucide-react";

export type StageState = "done" | "current" | "upcoming";

export interface Stage {
  id: string;
  /** The stage's name, e.g. "Test". */
  label: string;
  state: StageState;
  /** What the stage asks of you, shown only on the current stage so the list stays quiet. */
  description?: ReactNode;
  /** Where to go for it, e.g. a `TextLink` to the file it's about, on the right of its row. */
  action?: ReactNode;
}

interface Props {
  /** The stages in the order they're gone through. */
  stages: Stage[];
  /** Names the list for screen readers, e.g. "Stages". */
  label?: string;
}

/**
 * A short checklist of stages joined by a line: a tick for each one done, a
 * ring on the one you're on (with what it asks of you), an empty circle for
 * what's still to come. For saying where something is in a process without
 * a wizard's weight.
 */
export default function StageList({ stages, label }: Props) {
  return (
    <ol aria-label={label} className="relative">
      {stages.map((stage, i) => {
        const last = i === stages.length - 1;
        const current = stage.state === "current";
        return (
          <li key={stage.id} aria-current={current ? "step" : undefined} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className={`absolute left-[9px] top-6 bottom-1 w-px ${stage.state === "done" ? "bg-green-300" : "bg-gray-200"}`}
              />
            )}
            <Marker state={stage.state} />
            <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
              <div className="min-w-0">
                <div className={`text-sm ${current ? "font-semibold text-gray-900" : stage.state === "done" ? "text-gray-500" : "text-gray-400"}`}>
                  {stage.label}
                  <span className="sr-only">{current ? " (current)" : stage.state === "done" ? " (done)" : ""}</span>
                </div>
                {current && stage.description && <div className="mt-1 text-sm text-gray-600">{stage.description}</div>}
              </div>
              {stage.action && <div className="flex flex-none items-center pt-px text-sm">{stage.action}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Marker({ state }: { state: StageState }) {
  if (state === "done")
    return (
      <span aria-hidden className="relative mt-px flex h-[19px] w-[19px] flex-none items-center justify-center rounded-full bg-green-600 text-white">
        <Check size={12} strokeWidth={3} />
      </span>
    );
  return (
    <span
      aria-hidden
      className={`relative mt-px flex h-[19px] w-[19px] flex-none items-center justify-center rounded-full border-2 bg-white ${
        state === "current" ? "border-indigo-500" : "border-gray-300"
      }`}
    >
      {state === "current" && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
    </span>
  );
}
