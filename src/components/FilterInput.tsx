import { cn } from "../utils/cn";
import IconButton from "./IconButton";
import { controlClasses } from "./controlClasses";

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
          className={controlClasses(false, "rounded-md py-1.5 pl-10 pr-10 placeholder:text-gray-400")}
        />
        {value !== "" && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <IconButton icon="hero-x-mark" label="Clear filter" onClick={() => onChange("")} />
          </div>
        )}
      </div>
    </div>
  );
}
