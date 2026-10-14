import { useMemo, useState } from "react";
import { matchesQuery } from "../utils/search";

export type SortDirection = "asc" | "desc";
export type SortValue = string | number | boolean | null;

/**
 * Sort state for a table (Lightning's `TableHelpers.toggle_sort_direction`):
 * clicking the active column flips its direction, clicking another column
 * sorts it by `newColumnDirection`. Use on its own when the rows are sorted
 * elsewhere (the server, or a parent); `thProps` wires a sortable `<Th>`.
 */
export function useSort<K extends string>(
  initialKey: K,
  { initialDirection = "asc", newColumnDirection = "asc" }: { initialDirection?: SortDirection; newColumnDirection?: SortDirection } = {}
) {
  const [sortKey, setSortKey] = useState<K>(initialKey);
  const [direction, setDirection] = useState<SortDirection>(initialDirection);
  const toggle = (key: K) => {
    if (key === sortKey) setDirection((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDirection(newColumnDirection);
    }
  };
  /** Props for a sortable `<Th>`. */
  const thProps = (key: K) => ({
    sortDirection: key === sortKey ? direction : null,
    onSort: () => toggle(key),
  });
  return { sortKey, direction, toggle, thProps };
}

/**
 * A comparator for `Array.sort`. Strings use `localeCompare`, so case
 * interleaves ("apple" < "Banana"). `nulls` says where empty values go when
 * ascending; descending reverses everything, nulls included.
 */
export function compareBy<T>(get: (row: T) => SortValue, direction: SortDirection, nulls: "first" | "last" = "first") {
  return (a: T, b: T) => {
    const x = get(a);
    const y = get(b);
    let r: number;
    if (x === y) r = 0;
    else if (x === null) r = nulls === "first" ? -1 : 1;
    else if (y === null) r = nulls === "first" ? 1 : -1;
    else if (typeof x === "string" && typeof y === "string") r = x.localeCompare(y);
    else r = x < y ? -1 : 1;
    return direction === "asc" ? r : -r;
  };
}

/**
 * Lightning's `TableHelpers.filter_and_sort` for tables sorted in the
 * browser: `useSort`, plus an optional case-insensitive "contains" filter over
 * `searchFields`, returning the rows ready to render.
 */
export function useTableSort<T, K extends string>({
  rows,
  sortMap,
  initialKey,
  initialDirection,
  searchFields,
  nulls,
}: {
  rows: T[];
  /** How to read each sortable column's value from a row. */
  sortMap: Record<K, (row: T) => SortValue>;
  initialKey: NoInfer<K>;
  initialDirection?: SortDirection;
  searchFields?: ((row: T) => string)[];
  nulls?: "first" | "last";
}) {
  const { sortKey, direction, thProps } = useSort<K>(initialKey, { initialDirection });
  const [filter, setFilter] = useState("");

  const sorted = useMemo(() => {
    const filtered = searchFields ? rows.filter((r) => matchesQuery(filter, ...searchFields.map((f) => f(r)))) : rows;
    return [...filtered].sort(compareBy(sortMap[sortKey], direction, nulls));
  }, [rows, filter, sortKey, direction, sortMap, searchFields, nulls]);

  return { rows: sorted, sortKey, direction, thProps, filter, setFilter };
}
