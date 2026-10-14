import { useState } from "react";

export type SortDirection = "asc" | "desc";

/**
 * Lightning's `TableHelpers.toggle_sort_direction`: clicking the active
 * column flips its direction, clicking another column sorts it ascending.
 */
export function useSort<K extends string>(initialKey: K, initialDirection: SortDirection = "asc") {
  const [sortKey, setSortKey] = useState<K>(initialKey);
  const [direction, setDirection] = useState<SortDirection>(initialDirection);
  const toggle = (key: K) => {
    if (key === sortKey) setDirection((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDirection("asc");
    }
  };
  /** Props for a sortable `<Th>`. */
  const thProps = (key: K) => ({
    sortDirection: key === sortKey ? direction : null,
    onSort: () => toggle(key),
  });
  return { sortKey, direction, toggle, thProps };
}

export function compareBy<T>(get: (row: T) => string | number | boolean | null, direction: SortDirection) {
  return (a: T, b: T) => {
    const x = get(a);
    const y = get(b);
    let r: number;
    if (x === y) r = 0;
    else if (x === null) r = -1;
    else if (y === null) r = 1;
    else if (typeof x === "string" && typeof y === "string") r = x.localeCompare(y);
    else r = x < y ? -1 : 1;
    return direction === "asc" ? r : -r;
  };
}
