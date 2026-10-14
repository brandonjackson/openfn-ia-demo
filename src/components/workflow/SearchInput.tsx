import type { InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import IconButton from "../IconButton";
import { controlClasses } from "../controlClasses";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: string;
  onChange: (value: string) => void;
  /** Accessible name; defaults to the placeholder. */
  label?: string;
}

/**
 * A text field with a magnifying glass and, once it has text, a clear
 * button. Used by the editor's adaptor, template, dataclip and conversation
 * searches.
 */
export default function SearchInput({ value, onChange, label, placeholder, className, ...rest }: Props) {
  return (
    <div className={cn("relative", className)}>
      <span className="hero-magnifying-glass pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={controlClasses(false, "pl-9 pr-9 placeholder:text-gray-400")}
        {...rest}
      />
      {value && (
        <IconButton
          icon="hero-x-mark"
          label="Clear search"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={() => onChange("")}
        />
      )}
    </div>
  );
}
