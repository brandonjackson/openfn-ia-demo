import { cn } from "../utils/cn";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Lightning's table filter box (TableHelpers.filter_input): a max-w-sm text
 * field with a magnifying glass, and an x that clears it once it has text.
 */
export default function FilterInput({ value, onChange, placeholder, className }: Props) {
  return (
    <div className={cn("mb-4", className)}>
      <div className="relative max-w-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="hero-magnifying-glass h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          name="filter"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "focus:outline focus:outline-2 focus:outline-offset-1 block w-full rounded-md border-slate-300 focus:border-slate-400 focus:outline-primary-600",
            "py-1.5 pl-10 pr-10 text-gray-900 placeholder:text-gray-400 focus:ring-inset sm:text-sm sm:leading-6"
          )}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button
            type="button"
            aria-label="Clear filter"
            className={cn("flex cursor-pointer", value === "" && "hidden")}
            onClick={() => onChange("")}
          >
            <span className="hero-x-mark h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
