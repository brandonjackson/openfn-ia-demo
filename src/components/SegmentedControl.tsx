interface Props {
  /** Shown before the options, e.g. "Status". */
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  /**
   * `joined` is a row of joined buttons for filters; `pill` is a borderless
   * row of soft pills for switching views, e.g. Canvas / Code in the editor.
   */
  appearance?: "joined" | "pill";
  /** Tooltip per option, e.g. a keyboard shortcut. */
  titles?: Record<string, string>;
}

/**
 * A row of toggle buttons for picking one value, e.g. All / Success / Failed
 * above a list or table, or which view of a workflow to show.
 */
export default function SegmentedControl({ label, options, value, onChange, appearance = "joined", titles }: Props) {
  const pill = appearance === "pill";
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs font-medium text-gray-500">{label}:</span>}
      <div
        className={pill ? "flex items-center gap-0.5" : "flex overflow-hidden rounded-md border border-gray-200"}
        role="group"
        aria-label={label}
      >
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            aria-pressed={value === opt}
            title={titles?.[opt]}
            onClick={() => onChange(opt)}
            className={
              pill
                ? `rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    value === opt ? "bg-gray-200/70 font-medium text-gray-900" : "text-gray-500 hover:text-gray-900"
                  }`
                : `px-3 py-1 text-xs font-medium transition-colors ${
                    value === opt ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"
                  }`
            }
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
