import { cn } from "../../utils/cn";

export interface EditorTabOption<T extends string> {
  value: T;
  label: string;
  /** Hero icon class, e.g. `hero-document-text`. */
  icon?: string;
}

/**
 * The editor's tabs (collaborative-editor/components/Tabs.tsx): `pills` on
 * a slate-100 track (Docs/Metadata, Empty/Custom/Existing) or `underline`
 * (Logs/Input/Output).
 */
export default function EditorTabs<T extends string>({
  value,
  onChange,
  options,
  variant = "underline",
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: EditorTabOption<T>[];
  variant?: "pills" | "underline";
  className?: string;
}) {
  if (variant === "pills") {
    return (
      <div className={cn("bg-slate-100 p-1 rounded-lg", className)}>
        <nav className="flex gap-1" aria-label="Tabs">
          {options.map((o) => {
            const selected = value === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onChange(o.value)}
                className={cn(
                  "flex-1 rounded-md px-3 py-2 text-sm font-medium flex items-center justify-center transition-all duration-200",
                  selected ? "bg-white text-indigo-600" : "text-gray-500 hover:text-gray-700 hover:bg-slate-50"
                )}
                aria-current={selected ? "page" : undefined}
              >
                {o.icon && <span className={cn(o.icon, "inline-block h-5 w-5 mr-2")} aria-hidden="true" />}
                <span>{o.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }
  return (
    <div className={className}>
      <nav className="flex flex-row space-x-6" aria-label="Tabs">
        {options.map((o) => {
          const selected = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                "group inline-flex items-center border-b-2 px-1 py-1 text-xs font-semibold leading-tight transition-colors",
                selected
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}
              aria-current={selected ? "page" : undefined}
            >
              <span>{o.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
