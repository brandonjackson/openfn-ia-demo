import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { optionState, pickerStyles as s } from "../primitives/picker-chrome";

/** Where the demo's data comes from: its own fixtures, or a real Lightning's API. */
export type DataSource = "fixtures" | "lightning";

interface Props {
  /** The source in use. */
  source: DataSource;
  /** Whether this deployment can reach a Lightning: only the one Lightning serves at /v3. */
  lightningAvailable: boolean;
  /** Switches to another source. The app reloads, since everything on screen came from the old one. */
  onChoose: (source: DataSource) => void;
  /**
   * Puts the fixtures back to their starting point, forgetting everything
   * made, changed or deleted in this browser. Left out, there's no reset.
   */
  onResetData?: () => Promise<void>;
}

const options: { id: DataSource; name: string; description: string }[] = [
  {
    id: "fixtures",
    name: "Demo fixtures",
    description: "The demo's made-up organisation, projects and run history. What you change is kept in this browser.",
  },
  {
    id: "lightning",
    name: "Lightning",
    description: "This Lightning's own data, through its API. Whatever its API doesn't have yet shows empty.",
  },
];

/**
 * The Data section of the demo settings: which source the app reads, never a
 * mix of the two. The fixtures can be reset; Lightning is only offered where
 * the app is served by one, and says so where it isn't.
 *
 * It's the demo's own chrome, styled with the theme-independent --picker-*
 * tokens like the rest of the demo settings.
 */
export default function DataSourcePicker({ source, lightningAvailable, onChoose, onResetData }: Props) {
  const [hover, setHover] = useState<DataSource | null>(null);
  // "confirm" after the first click, so one stray click doesn't throw away a demo's changes.
  const [reset, setReset] = useState<"idle" | "confirm" | "resetting" | "done">("idle");

  return (
    <div>
      <p style={s.subtitle}>Where the app's data comes from. Switching reloads the page.</p>
      <ul role="radiogroup" aria-label="Data source" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        {options.map((option) => {
          const active = option.id === source;
          const unavailable = option.id === "lightning" && !lightningAvailable;
          return (
            <li key={option.id}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                aria-disabled={unavailable || undefined}
                onClick={() => !active && !unavailable && onChoose(option.id)}
                onMouseEnter={() => setHover(option.id)}
                onMouseLeave={() => setHover(null)}
                style={{
                  ...s.option,
                  ...optionState(active, hover === option.id && !unavailable),
                  cursor: unavailable ? "default" : "pointer",
                  opacity: unavailable ? 0.55 : 1,
                }}
              >
                <span style={s.optionText}>
                  <span style={s.optionName}>{option.name}</span>
                  <span style={s.optionDesc}>
                    {unavailable ? "Only where a Lightning serves the demo, at /v3 on the Lightning deployment." : option.description}
                  </span>
                </span>
                <span style={s.check}>{active && <Check size={16} />}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {source === "fixtures" && onResetData && (
        <button
          type="button"
          aria-disabled={reset === "resetting"}
          onClick={() => {
            if (reset === "resetting") return;
            if (reset !== "confirm") return setReset("confirm");
            setReset("resetting");
            void onResetData().then(
              () => setReset("done"),
              () => setReset("idle"),
            );
          }}
          onBlur={() => setReset((r) => (r === "confirm" ? "idle" : r))}
          style={{ ...s.button, marginTop: 12 }}
        >
          {reset === "done" ? <Check size={14} /> : <RotateCcw size={14} />}
          {reset === "confirm"
            ? "Click again to reset everything"
            : reset === "resetting"
              ? "Resetting…"
              : reset === "done"
                ? "Back to the starting data"
                : "Reset demo data"}
        </button>
      )}
    </div>
  );
}
