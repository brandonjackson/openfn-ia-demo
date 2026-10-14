import type { MouseEvent, ReactNode, TdHTMLAttributes } from "react";
import { cn } from "../utils/cn";

/**
 * Lightning's table components (components/table.ex): a ringed, rounded
 * card with a gray-50 header row and white body. Compose with Tr / Th / Td.
 */
export function Table({
  header,
  children,
  footer,
  divide = true,
  id,
}: {
  header: ReactNode;
  children: ReactNode;
  /** Rendered under the table, e.g. a Pagination bar. */
  footer?: ReactNode;
  divide?: boolean;
  id?: string;
}) {
  return (
    <div id={id} data-ui="table" className="shadow ring-1 ring-black/5 sm:rounded-lg bg-gray-50">
      <table className={cn("min-w-full", divide && "divide-y divide-gray-200")}>
        <thead>{header}</thead>
        <tbody className={cn("bg-white", divide && "divide-y divide-gray-200")}>{children}</tbody>
      </table>
      {footer && <div className={cn(divide && "border-t border-gray-200")}>{footer}</div>}
    </div>
  );
}

/** True when a click landed on a link, button or input inside the row, which handles it itself. */
function clickedControl(e: MouseEvent<HTMLElement>) {
  const control = (e.target as HTMLElement).closest("a, button, input, select, textarea, label, [role=switch]");
  return control !== null && e.currentTarget.contains(control);
}

/** A row. With `onClick` the whole row is clickable; links and buttons inside it still do their own thing. */
export function Tr({
  children,
  onClick,
  className,
  id,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  id?: string;
}) {
  return (
    <tr
      id={id}
      onClick={onClick && ((e) => !clickedControl(e) && onClick())}
      className={cn(
        "transition-colors duration-150",
        "has-[td]:hover:bg-gray-50",
        onClick && "cursor-pointer",
        "last:rounded-b-lg",
        "[&>td:first-child]:py-4 [&>td:first-child]:pr-3 [&>td:first-child]:pl-4 [&>td:first-child]:sm:pl-6",
        "[&>th:first-child]:py-3.5 [&>th:first-child]:pr-3 [&>th:first-child]:pl-4 [&>th:first-child]:sm:pl-6",
        "[&>td:not(:first-child):not(:last-child)]:px-3 [&>td:not(:first-child):not(:last-child)]:py-4",
        "[&>th:not(:first-child):not(:last-child)]:px-3 [&>th:not(:first-child):not(:last-child)]:py-3.5",
        "[&>td:last-child]:relative [&>td:last-child]:py-4 [&>td:last-child]:pr-4 [&>td:last-child]:pl-3 [&>td:last-child]:sm:pr-6",
        "[&>th:last-child]:relative [&>th:last-child]:py-3.5 [&>th:last-child]:pr-4 [&>th:last-child]:pl-3 [&>th:last-child]:sm:pr-6",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function Th({
  children,
  className,
  colSpan,
  sortDirection,
  onSort,
}: {
  children?: ReactNode;
  className?: string;
  colSpan?: number;
  /** When set the header is sortable; "asc" / "desc" marks the active column. */
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
}) {
  return (
    <th
      scope="col"
      colSpan={colSpan}
      className={cn("text-sm text-left font-semibold text-gray-900 select-none whitespace-nowrap", className)}
    >
      {onSort ? (
        <button type="button" onClick={onSort} className="group inline-flex items-center">
          {children}
          <span
            className={cn(
              "ml-2 flex-none rounded-sm",
              sortDirection ? "bg-gray-100 text-gray-900 group-hover:bg-gray-200" : "invisible text-gray-400 group-hover:visible"
            )}
          >
            <span className={cn(sortDirection === "asc" ? "hero-chevron-up" : "hero-chevron-down", "h-5 w-5")} />
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export function Td({ children, className, ...rest }: TdHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <td className={cn("text-sm text-gray-500 first:rounded-bl-lg last:rounded-br-lg", className)} {...rest}>
      {children}
    </td>
  );
}

/**
 * Dashed "nothing here yet" box (table.ex `empty_state`). With `onClick` it's
 * a button that starts the create flow.
 */
export function EmptyState({
  icon = "hero-plus-circle",
  message,
  buttonText,
  onClick,
  disabled,
}: {
  icon?: string;
  message: ReactNode;
  buttonText?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  if (buttonText) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 disabled:hover:border-gray-300 focus:outline-none"
      >
        <span className={cn(icon, "mx-auto w-12 h-12 text-gray-400")} />
        <span className="mt-2 block text-xs font-semibold text-gray-600">{buttonText}</span>
        <div className="mt-2 text-xs text-gray-500">{message}</div>
      </button>
    );
  }
  return (
    <div className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center">
      <span className={cn(icon, "mx-auto w-12 h-12 text-gray-400")} />
      <div className="mt-2 text-xs text-gray-500">{message}</div>
    </div>
  );
}
