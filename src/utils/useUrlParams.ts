import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/** Query params to set (a string) or remove (`null`); others are left alone. */
export type ParamPatch = Record<string, string | null>;

/**
 * The URL's query params as a plain object, and `update(patch)` to set or
 * remove some of them without touching the rest. `update` copies the current
 * params rather than mutating them.
 */
export function useUrlParams() {
  const [search, setSearch] = useSearchParams();
  const params = useMemo(() => Object.fromEntries(search.entries()) as Record<string, string | undefined>, [search]);
  const update = useCallback(
    (patch: ParamPatch) =>
      setSearch((prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(patch)) {
          if (v === null) next.delete(k);
          else next.set(k, v);
        }
        return next;
      }),
    [setSearch]
  );
  return { params, update };
}
