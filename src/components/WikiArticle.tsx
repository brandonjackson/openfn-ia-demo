import type { WikiBlock, WikiInline, WikiSection } from "../page-data";
import TextLink from "./TextLink";

interface Props {
  sections: WikiSection[];
  /** Hide the "Contents" box, e.g. for a single-section article. */
  hideContents?: boolean;
}

function Inline({ content }: { content: WikiInline[] }) {
  return (
    <>
      {content.map((part, i) =>
        typeof part === "string" ? (
          <span key={i}>{part}</span>
        ) : (
          <TextLink key={i} to={part.to} variant="inline">
            {part.text}
          </TextLink>
        )
      )}
    </>
  );
}

function Block({ block }: { block: WikiBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-sm leading-relaxed text-gray-700">
          <Inline content={block.content} />
        </p>
      );
    case "list":
      return (
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-700">
          {block.items.map((item, i) => (
            <li key={i}>
              <Inline content={item} />
            </li>
          ))}
        </ul>
      );
    case "facts":
      return (
        <dl className="divide-y divide-gray-100 rounded-md border border-gray-200 text-sm">
          {block.rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[10rem_1fr] gap-4 px-4 py-2.5">
              <dt className="font-medium text-gray-900">{row.label}</dt>
              <dd className="text-gray-700">
                <Inline content={row.value} />
              </dd>
            </div>
          ))}
        </dl>
      );
  }
}

/**
 * A wiki-style article: a "Contents" box linking to each section, then the
 * sections themselves as headed prose, lists and label/value facts.
 */
export default function WikiArticle({ sections, hideContents = false }: Props) {
  return (
    <article className="space-y-8">
      {!hideContents && sections.length > 1 && (
        <nav className="inline-block rounded-md border border-gray-200 bg-gray-50 px-5 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Contents
          </p>
          <ol className="space-y-1 text-sm">
            {sections.map((section, i) => (
              <li key={section.id}>
                {/* The app uses a hash router, so scroll rather than change the hash. */}
                <a
                  href={`#${section.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  <span className="mr-2 text-gray-400">{i + 1}</span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-6">
          <h2 className="mb-3 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
            {section.title}
          </h2>
          <div className="space-y-4">
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
