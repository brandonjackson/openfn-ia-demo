/*
 * The component catalogue, read from src/components at build time by
 * scripts/component-catalog.ts. These types mirror the ones there.
 */
declare module "virtual:component-catalog" {
  export type CatalogLayer = "primitives" | "patterns" | "domain";

  export interface CatalogProp {
    name: string;
    /** The type as written in the source, e.g. `"sm" | "md"`. */
    type: string;
    optional: boolean;
    /** The comment over the prop. */
    description: string;
    /** The value it takes when left out. */
    defaultValue?: string;
  }

  export interface CatalogEntry {
    name: string;
    layer: CatalogLayer;
    /** From the repo root, e.g. `src/components/primitives/Button.tsx`. */
    file: string;
    /** How to import it from a page in `src/pages/<page>/`. */
    importLine: string;
    /** The JSDoc over the function. */
    description: string;
    props: CatalogProp[];
    /** What the props type extends, e.g. `ButtonHTMLAttributes<HTMLButtonElement>`. */
    extendsTypes: string[];
    /** The Storybook id of its first story, when it has stories. */
    storyId?: string;
    /** Files in src that import it, from the repo root. */
    usedBy: string[];
  }

  const catalog: CatalogEntry[];
  export default catalog;
}
