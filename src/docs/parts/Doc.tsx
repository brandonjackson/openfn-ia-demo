import type { ReactNode } from "react";
import Badge from "../../components/primitives/Badge";
import Inline from "../../components/primitives/Inline";
import Stack from "../../components/primitives/Stack";

/*
 * The docs' typography: a page, its sections and running prose. These are
 * the docs' own, like Storybook's chrome, because long-form reading wants a
 * rhythm the app's dense screens don't. Everything shown as an example on a
 * page is the real library.
 */

interface DocPageProps {
  /** Small label over the title: the group the page is in. */
  eyebrow?: string;
  title: string;
  /** The page's first paragraph, a little larger than the rest. */
  lead?: ReactNode;
  /** Badges after the title, e.g. a component's layer. */
  badges?: ReactNode;
  /** Links or buttons under the lead, e.g. Storybook and Source. */
  actions?: ReactNode;
  children: ReactNode;
}

/** One docs page: its title and lead, then its sections. */
export function DocPage({ eyebrow, title, lead, badges, actions, children }: DocPageProps) {
  return (
    <article className="pb-16">
      <header className="mb-10 border-b border-gray-200 pb-8">
        {eyebrow && <p className="mb-2 text-sm font-medium text-indigo-600">{eyebrow}</p>}
        <Inline gap="sm" wrap>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{title}</h1>
          {badges}
        </Inline>
        {lead && <div className="mt-3 max-w-3xl text-lg leading-relaxed text-gray-600">{lead}</div>}
        {actions && <div className="mt-5">{actions}</div>}
      </header>
      <div className="space-y-12">{children}</div>
    </article>
  );
}

/** A section of a page, under a heading other pages can link to by its `id`. */
export function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">{title}</h2>
      <Stack gap="md">{children}</Stack>
    </section>
  );
}

/** A heading inside a section. */
export function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="mt-4 text-base font-semibold text-gray-900">{children}</h3>;
}

/** A paragraph of running prose. */
export function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-[15px] leading-7 text-gray-700">{children}</p>;
}

/** A bulleted (or, with `ordered`, numbered) list of points. */
export function Bullets({ items, ordered = false }: { items: ReactNode[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`max-w-3xl space-y-2 pl-5 text-[15px] leading-7 text-gray-700 ${ordered ? "list-decimal" : "list-disc"}`}>
      {items.map((item, i) => (
        <li key={i} className="pl-1">
          {item}
        </li>
      ))}
    </Tag>
  );
}

/** A component's layer, as a tag: Primitive, Pattern or Domain. */
export function LayerBadge({ layer }: { layer: "primitives" | "patterns" | "domain" }) {
  const look = {
    primitives: { label: "Primitive", tone: "gray" },
    patterns: { label: "Pattern", tone: "indigo" },
    domain: { label: "Domain", tone: "pink" },
  } as const;
  return <Badge label={look[layer].label} tone={look[layer].tone} shape="tag" />;
}
