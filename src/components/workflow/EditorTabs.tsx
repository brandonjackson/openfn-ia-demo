import { cn } from "../../utils/cn";

export interface EditorTabOption<T extends string> {
  value: T;
  label: string;
  /** Hero icon class, e.g. `hero-document-text`. */
  icon?: string;
}

/**
 * Segmented pill tabs on a slate-100 track (collaborative-editor/components/
 * Tabs.tsx, `pills` variant): Docs / Metadata, Empty / Custom / Existing.
 * For underlined text tabs use the shared `Tabs`.
 */
export default function EditorTabs<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: EditorTabOption<T>[];
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg bg-slate-100 p-1", className)}>
      <div role="tablist" className="flex gap-1">
        {options.map((o) => {
          const selected = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(o.value)}
              className={cn(
                "flex flex-1 items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                selected ? "bg-white text-primary-600" : "text-gray-500 hover:bg-slate-50 hover:text-gray-700"
              )}
            >
              {o.icon && <span className={cn(o.icon, "mr-2 h-5 w-5")} aria-hidden="true" />}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
