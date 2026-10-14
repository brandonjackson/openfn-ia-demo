import { cn } from "../../utils/cn";
import IconButton from "../IconButton";
import { controlClasses } from "../controlClasses";

/**
 * The magnifier search box (WorkflowLive `search_workflows_input`, and
 * History's search field): an input with a search icon on the left and a
 * clear (x) button once typed in. w-96 unless `className` says otherwise.
 */
export default function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Called after the x button empties the box. */
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-96", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="hero-magnifying-glass h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={controlClasses(false, "py-2 pl-10 pr-10 placeholder:text-gray-400")}
      />
      {value !== "" && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          <IconButton
            id="clear_search_button"
            icon="hero-x-mark"
            label="Clear search"
            className="text-gray-400"
            onClick={() => {
              onChange("");
              onClear?.();
            }}
          />
        </div>
      )}
    </div>
  );
}
