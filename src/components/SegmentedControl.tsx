interface Props {
  /** Shown before the options, e.g. "Status". */
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * A row of joined toggle buttons for picking one filter value, e.g.
 * All / Success / Failed above a list or table.
 */
export default function SegmentedControl({ label, options, value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs font-medium text-gray-500">{label}:</span>}
      <div className="flex overflow-hidden rounded-md border border-gray-200" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            aria-pressed={value === opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              value === opt ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
