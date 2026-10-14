/**
 * Case-insensitive "contains" search: true when the trimmed query is empty
 * or any field includes it. Null and undefined fields never match.
 */
export function matchesQuery(query: string, ...fields: (string | null | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => !!f && f.toLowerCase().includes(q));
}
