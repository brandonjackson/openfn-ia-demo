import { cn } from "../../utils/cn";

/**
 * The magnifier search box (WorkflowLive `search_workflows_input`): a w-96
 * input with a search icon on the left and a clear (x) button once typed in.
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative rounded-md shadow-xs w-96", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="hero-magnifying-glass h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border-slate-300 py-2 pl-10 pr-10 text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary-600 focus:ring-0 sm:text-sm sm:leading-6"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        <button
          type="button"
          id="clear_search_button"
          className={cn(value === "" && "hidden")}
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <span className="hero-x-mark h-5 w-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
