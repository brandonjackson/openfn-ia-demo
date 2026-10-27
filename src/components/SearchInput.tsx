import type { InputHTMLAttributes, Ref } from "react";
import { Search } from "lucide-react";
import { TextInput } from "./FormControls";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** The height of a `sm` Button, for a search in a narrow panel or a header. */
  compact?: boolean;
  ref?: Ref<HTMLInputElement>;
}

/**
 * A text input with a magnifier on the left, for filtering a list in place:
 * systems to connect, conversations, an adaptor's operations. The placeholder
 * doubles as its accessible name unless an `aria-label` is given.
 */
export default function SearchInput({ compact = false, className = "", placeholder, ...rest }: Props) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={compact ? 14 : 16}
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400 ${compact ? "left-2.5" : "left-3"}`}
      />
      <TextInput
        type="search"
        compact={compact}
        placeholder={placeholder}
        aria-label={rest["aria-label"] ?? placeholder}
        className={compact ? "pl-8" : "pl-9"}
        {...rest}
      />
    </div>
  );
}
