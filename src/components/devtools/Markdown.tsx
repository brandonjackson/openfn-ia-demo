import { useMemo } from "react";
import { Marked } from "marked";
import { cn } from "../../utils/cn";

// Annotation files are plain markdown. Raw HTML in them is shown as text
// rather than injected, and links open in a new tab.
const marked = new Marked({
  gfm: true,
  renderer: {
    html({ text }) {
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
    link({ href, tokens }) {
      const label = this.parser.parseInline(tokens);
      const safe = /^(https?:|mailto:|#)/.test(href) ? href : "#";
      return `<a href="${safe}" target="_blank" rel="noreferrer">${label}</a>`;
    },
  },
});

/** Renders a markdown string with Tailwind Typography, sized for a side panel. */
export default function Markdown({ source, className }: { source: string; className?: string }) {
  const html = useMemo(() => marked.parse(source, { async: false }), [source]);
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none prose-headings:font-semibold prose-h2:text-base prose-h2:mt-6 prose-h3:text-sm",
        "prose-code:before:content-none prose-code:after:content-none prose-code:bg-gray-100 prose-code:rounded prose-code:px-1 prose-code:font-normal",
        "prose-pre:bg-slate-800 prose-pre:text-xs prose-table:text-xs prose-a:text-primary-600",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
