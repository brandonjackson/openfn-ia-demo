import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { FieldError, Label } from "../Inputs";

/**
 * Lightning's password `.input` (new_inputs.ex): a text field with an eye
 * icon that toggles between hidden and shown.
 */
export default function PasswordInput({
  label,
  required,
  errors = [],
  id,
  className,
  ...rest
}: { label?: ReactNode; errors?: string[] } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </Label>
      )}
      <div className="relative mt-2 rounded-lg shadow-xs">
        <input
          id={id}
          type={revealed ? "text" : "password"}
          required={required}
          className={cn(
            "focus:outline focus:outline-2 focus:outline-offset-1 block w-full rounded-lg text-slate-900 focus:ring-0 sm:text-sm sm:leading-6",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
            className,
            errors.length === 0
              ? "border-slate-300 focus:border-slate-400 focus:outline-primary-600"
              : "border-danger-400 focus:border-danger-400 focus:outline-danger-400"
          )}
          {...rest}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <span
            role="button"
            aria-label={revealed ? "Hide password" : "Show password"}
            onClick={() => setRevealed((r) => !r)}
            className={cn(revealed ? "hero-eye" : "hero-eye-slash", "h-5 w-5 cursor-pointer")}
          />
        </div>
      </div>
      {errors.length > 0 && (
        <div className="error-space">
          {errors.map((e) => (
            <FieldError key={e}>{e}</FieldError>
          ))}
        </div>
      )}
    </div>
  );
}
