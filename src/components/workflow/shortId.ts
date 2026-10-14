/** Lightning's truncateUid / displayShortUuid: the first 7 characters. */
export function shortId(id: string): string {
  return id.slice(0, 7);
}
