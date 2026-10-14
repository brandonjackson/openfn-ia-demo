import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import IconButton from "../IconButton";
import { Field } from "../Inputs";
import { controlClasses } from "../controlClasses";

/**
 * Lightning's password `.input` (new_inputs.ex): a text field with an eye
 * button that toggles between hidden and shown.
 */
export default function PasswordInput({
  label,
  required,
  hint,
  errors = [],
  id,
  className,
  ...rest
}: { label?: ReactNode; hint?: ReactNode; errors?: string[] } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [revealed, setRevealed] = useState(false);
  return (
    <Field id={id} label={label} required={required} hint={hint} errors={errors}>
      <div className="relative">
        <input
          id={id}
          type={revealed ? "text" : "password"}
          required={required}
          data-ui="field"
          className={controlClasses(errors.length > 0, cn("pr-10", className))}
          {...rest}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          <IconButton
            icon={revealed ? "hero-eye" : "hero-eye-slash"}
            label={revealed ? "Hide password" : "Show password"}
            onClick={() => setRevealed((r) => !r)}
          />
        </div>
      </div>
    </Field>
  );
}
