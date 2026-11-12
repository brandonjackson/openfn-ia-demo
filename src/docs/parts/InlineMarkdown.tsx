import Code from "../../components/primitives/Code";

/**
 * A comment from the source, with its `backticks` drawn as code. The
 * catalogue's descriptions are JSDoc, which uses backticks for names.
 */
export default function InlineMarkdown({ text }: { text: string }) {
  const parts = text.replace(/\s*\n\s*/g, " ").split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") && part.length > 1 ? <Code key={i}>{part.slice(1, -1)}</Code> : part
      )}
    </>
  );
}
