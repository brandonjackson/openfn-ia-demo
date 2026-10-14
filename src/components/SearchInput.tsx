import type { InputHTMLAttributes } from "react";
import { cn } from "../utils/cn";
import IconButton from "./IconButton";
import { controlClasses } from "./controlClasses";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "size"> {
  value: string;
  onChange: (value: string) => void;
  /** Called after the clear button empties the box. */
  onClear?: () => void;
  /** Accessible name; defaults to the placeholder. */
  label?: string;
  /** `sm` for compact panels and pickers. */
  size?: "sm" | "md";
}

/**
 * A text field with a magnifying glass and, once it has text, a clear
 * button. Full width: set the width (and any margin) with `className`.
 */
export default function SearchInput({ value, onChange, onClear, label, placeholder = "Search", size = "md", className, ...rest }: Props) {
  const sm = size === "sm";
  return (
    <div className={cn("relative", className)}>
      <span
        className={cn(
          "hero-magnifying-glass pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400",
          sm ? "left-3 h-4 w-4" : "left-3 h-5 w-5"
        )}
      />
      <input
        type="text"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={controlClasses(false, cn("placeholder:text-gray-400", sm ? "py-1.5 pl-9 pr-9" : "py-2 pl-10 pr-10"))}
        {...rest}
      />
      {value !== "" && (
        <IconButton
          icon="hero-x-mark"
          label="Clear search"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={() => {
            onChange("");
            onClear?.();
          }}
        />
      )}
    </div>
  );
}
