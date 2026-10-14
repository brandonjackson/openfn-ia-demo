import type { InputHTMLAttributes, ReactNode } from "react";

/**
 * Lightning's older `Form.check_box`: a checkbox with a font-medium label
 * to its right and optional helper content under the label.
 */
export default function CheckBoxField({
  id,
  label,
  children,
  ...rest
}: { id: string; label: ReactNode; children?: ReactNode } & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id">) {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={id}
          type="checkbox"
          className="focus:ring-primary-500 h-4 w-4 text-primary-600 text-sm border-secondary-300 rounded disabled:bg-gray-300 focus:disabled:ring-gray-300 disabled:text-gray-300"
          {...rest}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={id} className="font-medium text-secondary-700">
          {label}
        </label>
        {children}
      </div>
    </div>
  );
}
