export interface SegmentedOption {
  id: string;
  label: string;
  /** Small count or badge after the label. */
  count?: number;
  disabled?: boolean;
}

interface Props {
  /** Shown before the options, e.g. "Status". */
  label?: string;
  /** Plain strings double as both id and label. */
  options: (string | SegmentedOption)[];
  value: string;
  onChange: (value: string) => void;
  /**
   * `boxed` is the bordered filter control used above lists and tables;
   * `pill` is the softer view switcher used in toolbars and tray headers,
   * where only the selected option is tinted.
   */
  variant?: "boxed" | "pill";
  size?: "sm" | "md";
}

/**
 * A row of joined toggle buttons for picking one value: All / Success / Failed
 * above a list, or Canvas / Code / Runs in the editor toolbar.
 */
export default function SegmentedControl({
  label,
  options,
  value,
  onChange,
  variant = "boxed",
  size = "sm",
}: Props) {
  const items: SegmentedOption[] = options.map((o) => (typeof o === "string" ? { id: o, label: o } : o));
  const text = size === "md" ? "text-sm" : "text-xs";

  if (variant === "pill") {
    return (
      <div className="flex items-center gap-2">
        {label && <span className="text-xs font-medium text-gray-500">{label}:</span>}
        <div className="flex items-center gap-0.5" role="group" aria-label={label}>
          {items.map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={value === opt.id}
              disabled={opt.disabled}
              onClick={() => onChange(opt.id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${text} ${
                value === opt.id ? "bg-gray-200/70 text-gray-900" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {opt.label}
              {opt.count !== undefined && (
                <span className="rounded-full bg-white px-1.5 text-[11px] text-gray-500">{opt.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs font-medium text-gray-500">{label}:</span>}
      <div className="flex overflow-hidden rounded-md border border-gray-200" role="group" aria-label={label}>
        {items.map((opt) => (
          <button
            key={opt.id}
            type="button"
            aria-pressed={value === opt.id}
            disabled={opt.disabled}
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${text} ${
              value === opt.id ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {opt.label}
            {opt.count !== undefined && <span className="ml-1 text-gray-400">{opt.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
