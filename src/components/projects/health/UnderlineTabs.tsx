import { cn } from "../../../utils/cn";

/**
 * Lightning's `tabbed-selector` tab list: text tabs with a primary underline
 * on the selected one (used by the health page's Work orders / Runs).
 */
export default function UnderlineTabs<T extends string>({
  tabs,
  selected,
  onSelect,
  label,
}: {
  tabs: T[];
  selected: T;
  onSelect: (tab: T) => void;
  label?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex space-x-4">
      {tabs.map((tab) => {
        const active = tab === selected;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(tab)}
            className={cn(
              "text-sm font-medium py-2 px-1 border-b-2 leading-tight outline-none focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
              active
                ? "border-b-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-600 hover:border-b-gray-300"
            )}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
