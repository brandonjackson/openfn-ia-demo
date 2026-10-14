import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { urlSafeName } from "../utils/format";
import { TextInput } from "./Inputs";
import NameBadge from "./NameBadge";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  id: string;
  label?: ReactNode;
  /** The name as typed. */
  value: string;
  /** Gets the typed name and the URL-safe name it becomes. */
  onChange: (raw: string, name: string) => void;
  /** Words before the badge, e.g. "Your project will be named". */
  badgeLabel: ReactNode;
  hint?: ReactNode;
  errors?: string[];
  /** Hide the badge while there are errors (Lightning's sandbox form does). */
  hideBadgeOnError?: boolean;
  /** Classes for the wrapper, e.g. a width. */
  fieldClassName?: string;
}

/**
 * A name input with the URL-safe name it will get underneath (Lightning's
 * derived name field: `derive_name_param` plus `name_badge`). Used for projects,
 * sandboxes and collections.
 */
export default function NameField({
  id,
  label = "Name",
  value,
  onChange,
  badgeLabel,
  hint,
  errors = [],
  hideBadgeOnError = false,
  fieldClassName,
  ...rest
}: Props) {
  const name = urlSafeName(value);
  return (
    <div className={cn("space-y-2", fieldClassName)}>
      <TextInput
        id={id}
        label={label}
        hint={hint}
        errors={errors}
        value={value}
        onChange={(e) => onChange(e.target.value, urlSafeName(e.target.value))}
        {...rest}
      />
      {!(hideBadgeOnError && errors.length > 0) && name !== "" && (
        <p className="text-xs text-gray-600">
          <NameBadge name={name}>{badgeLabel}</NameBadge>
        </p>
      )}
    </div>
  );
}
