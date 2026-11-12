/** Where the docs point outside themselves: Storybook and the source on GitHub. */

const repo = "https://github.com/brandonjackson/openfn-ia-demo";

/**
 * Storybook: `npm run storybook` on port 6006 while developing, and the
 * published copy beside the app (the deploy builds it into `storybook/`).
 */
export const storybookUrl = import.meta.env.DEV ? "http://localhost:6006/" : `${import.meta.env.BASE_URL}storybook/`;

/** A story in Storybook, by its id. */
export function storyUrl(storyId: string): string {
  return `${storybookUrl}?path=/story/${storyId}`;
}

/** A file in the repo, from its root, e.g. `src/components/primitives/Button.tsx`. */
export function sourceUrl(path: string): string {
  return `${repo}/blob/main/${path}`;
}
