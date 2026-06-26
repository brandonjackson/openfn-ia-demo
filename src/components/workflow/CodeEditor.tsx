import { Fragment } from "react";

const KEYWORDS = new Set([
  "const",
  "let",
  "var",
  "return",
  "if",
  "else",
  "function",
  "true",
  "false",
  "null",
  "undefined",
]);
// OpenFn adaptor operations get a distinct colour.
const OPERATIONS = new Set(["fn", "get", "post", "put", "patch", "each", "alterState"]);

/**
 * Renders one line of code with very rough token highlighting: comments,
 * strings, keywords and adaptor operations. This is a read-only prototype
 * editor, not a real CodeMirror instance.
 */
function highlightLine(line: string) {
  const commentIdx = line.indexOf("//");
  const code = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
  const comment = commentIdx >= 0 ? line.slice(commentIdx) : "";

  // Split code on strings and word boundaries, keeping the delimiters.
  const tokens = code.split(/('[^']*'|"[^"]*"|`[^`]*`|\b)/g).filter(Boolean);

  return (
    <>
      {tokens.map((tok, i) => {
        if (/^['"`]/.test(tok)) {
          return (
            <span key={i} className="text-amber-600">
              {tok}
            </span>
          );
        }
        if (KEYWORDS.has(tok)) {
          return (
            <span key={i} className="text-purple-600">
              {tok}
            </span>
          );
        }
        if (OPERATIONS.has(tok)) {
          return (
            <span key={i} className="text-sky-600">
              {tok}
            </span>
          );
        }
        return <Fragment key={i}>{tok}</Fragment>;
      })}
      {comment && <span className="text-gray-400 italic">{comment}</span>}
    </>
  );
}

export default function CodeEditor({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <div className="flex h-full overflow-auto bg-white font-mono text-[13px] leading-6">
      {/* Gutter */}
      <div className="select-none border-r border-gray-100 bg-gray-50 px-3 py-3 text-right text-gray-300">
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      {/* Code */}
      <pre className="flex-1 overflow-x-auto py-3 pl-4 pr-6 text-gray-700">
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre">
            {line ? highlightLine(line) : " "}
          </div>
        ))}
      </pre>
    </div>
  );
}
