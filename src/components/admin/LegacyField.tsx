import type { InputHTMLAttributes, ReactNode } from "react";

type Props = {
  id: string;
  label: ReactNode;
  /** Hint under the label (the field's inner block). */
  hint?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id">;

/**
 * Lightning's older form helpers (live/components/form.ex `text_field` and
 * `password_field`), still used by the auth provider form: a label, an
 * optional hint, then a plain input (a ring for text, a border for
 * password, no reveal toggle).
 */
export default function LegacyField({ id, label, hint, type = "text", ...rest }: Props) {
  const isPassword = type === "password";
  return (
    <>
      <label htmlFor={id} className={isPassword ? "block text-sm font-medium text-secondary-700" : "block text-sm font-medium text-secondary-700 mb-1"}>
        {label}
      </label>
      {hint}
      <input
        id={id}
        type={type}
        autoComplete="off"
        className={
          isPassword
            ? "mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-xs sm:text-sm border-secondary-300 rounded-md"
            : "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6"
        }
        {...rest}
      />
    </>
  );
}
