import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";
export type SortValue = string | number | boolean;

/**
 * Lightning's TableHelpers.filter_and_sort + toggle_sort_direction: a
 * case-insensitive "contains" filter over some fields, then a sort on one
 * column. Clicking the active column flips direction; another column starts asc.
 */
export function useTableSort<T, K extends string>({
  rows,
  initialKey,
  sortMap,
  searchFields,
}: {
  rows: T[];
  initialKey: NoInfer<K>;
  sortMap: Record<K, (row: T) => SortValue>;
  searchFields: ((row: T) => string)[];
}) {
  const [sortKey, setSortKey] = useState<K>(initialKey);
  const [direction, setDirection] = useState<SortDirection>("asc");
  const [filter, setFilter] = useState("");

  const sorted = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const filtered = needle
      ? rows.filter((r) => searchFields.some((f) => f(r).toLowerCase().includes(needle)))
      : rows;
    const get = sortMap[sortKey];
    return [...filtered].sort((a, b) => {
      const [x, y] = [get(a), get(b)];
      const cmp = typeof x === "string" && typeof y === "string" ? x.localeCompare(y) : Number(x) - Number(y);
      return direction === "asc" ? cmp : -cmp;
    });
  }, [rows, filter, sortKey, direction, sortMap, searchFields]);

  const sortBy = (key: K) => {
    if (key === sortKey) setDirection((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDirection("asc");
    }
  };

  /** Props for a sortable <Th>. */
  const thProps = (key: K) => ({
    sortDirection: key === sortKey ? direction : null,
    onSort: () => sortBy(key),
  });

  return { rows: sorted, filter, setFilter, thProps };
}

/** Calendar.strftime(dt, "%d %b  %H:%M"), e.g. "14 Oct  18:36". */
export function formatShortDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${pad(d.getUTCDate())} ${month}  ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}
