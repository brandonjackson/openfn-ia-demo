import { Fragment } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  /** The column's heading: usually words, or a control such as a select-all checkbox. */
  header: ReactNode;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
  /** Leaves the column out on a phone, where only the columns that matter most fit. */
  hideOnMobile?: boolean;
  /** Shrinks the column to what's in it, e.g. a checkbox; others share the rest. */
  shrink?: boolean;
  /** Takes the width the other columns leave, cutting long text short (`Text truncate`) rather than pushing them off a narrow screen. */
  fill?: boolean;
}

interface Props<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  /** Shown in place of the table body when there are no rows. */
  emptyMessage?: string;
  /** Makes rows clickable, e.g. to select a run. */
  onRowClick?: (row: T) => void;
  /** Tints the selected row when rows are clickable. */
  selectedKey?: string;
  /** Tints every row picked, e.g. with a checkbox for a bulk action. */
  selectedKeys?: string[];
  /**
   * What a screen reader calls a clickable row, e.g. "Work order 896d2dcb,
   * failed". Clickable rows can be reached with Tab and opened with Enter or
   * Space.
   */
  rowLabel?: (row: T) => string;
  /**
   * Content for a full-width row under a row, e.g. the changes behind an
   * audit event. Return nothing to leave a row without one; the caller
   * decides which rows are open.
   */
  renderDetail?: (row: T) => ReactNode;
}

/** Whether a click landed on a control inside the row, which handles it itself. */
const onControl = (e: MouseEvent | KeyboardEvent) =>
  e.target !== e.currentTarget && !!(e.target as HTMLElement).closest("button, a, input, label, select, textarea");

/**
 * Bordered table for lists of records (credentials, collaborators, tokens).
 * Clicking a row (not a control in it) calls `onRowClick`; with
 * `renderDetail`, that's how a row opens to show more under it.
 */
export default function DataTable<T>({
  columns,
  rows,
  getRowKey,
  emptyMessage = "Nothing here yet.",
  onRowClick,
  selectedKey,
  selectedKeys = [],
  rowLabel,
  renderDetail,
}: Props<T>) {
  const responsive = (col: DataTableColumn<T>) => `${col.hideOnMobile ? "max-sm:hidden" : ""} ${col.shrink ? "w-px whitespace-nowrap" : ""} ${col.fill ? "w-full min-w-44 max-w-0 sm:min-w-56" : ""}`;
  return (
    <div data-ui="table" className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  col.align === "right" ? "text-right" : "text-left"
                } ${responsive(col)}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const detail = renderDetail?.(row);
              const key = getRowKey(row);
              const tinted = key === selectedKey || selectedKeys.includes(key);
              return (
                <Fragment key={key}>
                  <tr
                    onClick={onRowClick ? (e) => !onControl(e) && onRowClick(row) : undefined}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if ((e.key === "Enter" || e.key === " ") && !onControl(e)) {
                              e.preventDefault();
                              onRowClick(row);
                            }
                          }
                        : undefined
                    }
                    tabIndex={onRowClick ? 0 : undefined}
                    aria-label={onRowClick ? rowLabel?.(row) : undefined}
                    aria-expanded={onRowClick && renderDetail ? !!detail : undefined}
                    aria-selected={onRowClick && selectedKey !== undefined ? key === selectedKey : undefined}
                    className={`${onRowClick ? "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500" : ""} ${
                      tinted ? "bg-indigo-50" : "hover:bg-gray-50"
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-sm text-gray-500 ${col.align === "right" ? "text-right" : ""} ${responsive(col)}`}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                  {detail && (
                    <tr className="bg-gray-50">
                      <td colSpan={columns.length} className="px-4 py-3">
                        {detail}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
