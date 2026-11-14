import { useMemo, type ReactNode } from "react";
import Code from "./Code";
import CodeBlock from "./CodeBlock";
import TextLink from "./TextLink";
import { headingId, parseMarkdown, type MarkdownBlock, type MarkdownInline } from "./markdown";

interface Props {
  /** The Markdown to show. */
  source: string;
  /** Show a "Contents" box linking to each `##` section, when there's more than one. */
  contents?: boolean;
}

function Inline({ content }: { content: MarkdownInline[] }) {
  return (
    <>
      {content.map((part, i) => {
        switch (part.type) {
          case "text":
            return <span key={i}>{part.text}</span>;
          case "code":
            return <Code key={i}>{part.text}</Code>;
          case "strong":
            return (
              <strong key={i} className="font-semibold text-gray-900">
                <Inline content={part.children} />
              </strong>
            );
          case "em":
            return (
              <em key={i}>
                <Inline content={part.children} />
              </em>
            );
          case "link":
            // A path stays in the app; anything else opens in a new tab.
            return part.href.startsWith("/") ? (
              <TextLink key={i} to={part.href} variant="inline">
                <Inline content={part.children} />
              </TextLink>
            ) : (
              <TextLink key={i} href={part.href} variant="inline">
                <Inline content={part.children} />
              </TextLink>
            );
        }
      })}
    </>
  );
}

const headingClasses: Record<number, string> = {
  1: "text-xl font-semibold text-gray-900",
  2: "mb-3 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900",
  3: "text-base font-semibold text-gray-900",
  4: "text-sm font-semibold text-gray-900",
  5: "text-sm font-semibold text-gray-700",
  6: "text-xs font-semibold uppercase tracking-wide text-gray-500",
};

function Block({ block, ids }: { block: MarkdownBlock; ids: Map<MarkdownBlock, string> }): ReactNode {
  switch (block.type) {
    case "heading": {
      const Tag = `h${block.level}` as const;
      return (
        <Tag id={ids.get(block)} className={`scroll-mt-6 ${headingClasses[block.level]}`}>
          <Inline content={block.content} />
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p className="text-sm leading-relaxed text-gray-700">
          <Inline content={block.content} />
        </p>
      );
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List
          start={block.ordered && block.start !== 1 ? block.start : undefined}
          className={`${block.ordered ? "list-decimal" : "list-disc"} space-y-1.5 pl-5 text-sm leading-relaxed text-gray-700`}
        >
          {block.items.map((item, i) => (
            <li key={i}>
              <Inline content={item.content} />
              {item.children.length > 0 && (
                <div className="mt-1.5 space-y-1.5">
                  {item.children.map((child, j) => (
                    <Block key={j} block={child} ids={ids} />
                  ))}
                </div>
              )}
            </li>
          ))}
        </List>
      );
    }
    case "code":
      return <CodeBlock code={block.text} label={block.lang || undefined} tone="light" />;
    case "quote":
      return (
        <blockquote className="space-y-3 border-l-4 border-gray-200 pl-4 text-gray-600">
          {block.children.map((child, i) => (
            <Block key={i} block={child} ids={ids} />
          ))}
        </blockquote>
      );
    case "rule":
      return <hr className="border-gray-200" />;
    case "table":
      // Without a header row, each row is a label and its detail, the label in bold.
      return (
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-left text-sm">
            {block.header && (
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {block.header.map((cell, i) => (
                    <th key={i} scope="col" className="px-4 py-2 text-xs font-semibold text-gray-600">
                      <Inline content={cell} />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-gray-100">
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) =>
                    !block.header && c === 0 ? (
                      <th key={c} scope="row" className="w-40 px-4 py-2.5 align-top font-medium text-gray-900">
                        <Inline content={cell} />
                      </th>
                    ) : (
                      <td key={c} className="px-4 py-2.5 align-top text-gray-700">
                        <Inline content={cell} />
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

/**
 * Markdown, drawn: headings, paragraphs, lists, tables, code, quotes and
 * rules, with `code`, **strong**, *emphasis* and links inside them (a link to
 * a path stays in the app; any other opens in a new tab). Each `##` heading
 * starts a section, spaced apart and underlined, that `contents` links to,
 * the way a wiki article reads. The reader is in `markdown.ts`.
 */
export default function Markdown({ source, contents = false }: Props) {
  const { intro, sections, ids } = useMemo(() => {
    const blocks = parseMarkdown(source);
    const taken = new Set<string>();
    const ids = new Map<MarkdownBlock, string>();
    for (const b of blocks) if (b.type === "heading") ids.set(b, headingId(b.text, taken));
    // Blocks before the first ## heading, then each ## heading with what follows it.
    const intro: MarkdownBlock[] = [];
    const sections: { heading: Extract<MarkdownBlock, { type: "heading" }>; blocks: MarkdownBlock[] }[] = [];
    for (const b of blocks) {
      if (b.type === "heading" && b.level === 2) sections.push({ heading: b, blocks: [] });
      else (sections.at(-1)?.blocks ?? intro).push(b);
    }
    return { intro, sections, ids };
  }, [source]);

  return (
    <article className="space-y-8" data-ui="markdown">
      {intro.length > 0 && (
        <div className="space-y-4">
          {intro.map((b, i) => (
            <Block key={i} block={b} ids={ids} />
          ))}
        </div>
      )}
      {contents && sections.length > 1 && (
        <nav aria-label="Contents" className="inline-block rounded-md border border-gray-200 bg-gray-50 px-5 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Contents</p>
          <ol className="space-y-1 text-sm">
            {sections.map(({ heading }, i) => (
              <li key={i}>
                {/* The app uses a hash router, so scroll rather than change the hash. */}
                <a
                  href={`#${ids.get(heading)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(ids.get(heading)!)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  <span className="mr-2 text-gray-400">{i + 1}</span>
                  {heading.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      {sections.map(({ heading, blocks }, i) => (
        <section key={i}>
          <Block block={heading} ids={ids} />
          <div className="space-y-4">
            {blocks.map((b, j) => (
              <Block key={j} block={b} ids={ids} />
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
