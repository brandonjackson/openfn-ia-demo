/**
 * Lightning's `link` and `link-uuid` utilities (assets/css/app.css), as class
 * strings, so editor components can use them without touching the shared CSS.
 */
export const linkClasses =
  "cursor-pointer underline-offset-2 hover:underline hover:underline-offset-2 whitespace-nowrap inline-block text-primary-400 hover:text-primary-500";

export const linkUuidClasses =
  "cursor-pointer underline-offset-2 hover:underline hover:underline-offset-2 whitespace-nowrap inline-block text-xs font-mono p-1 rounded-md text-gray-500 bg-gray-100 hover:bg-gray-200";

/** Lightning's truncateUid / displayShortUuid: the first 7 characters. */
export function shortId(id: string): string {
  return id.slice(0, 7);
}
