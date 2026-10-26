import { Fragment, useRef, type KeyboardEvent } from "react";

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
 * strings, keywords and adaptor operations.
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

const INDENT = "  ";

interface Props {
  code: string;
  /** Called with the new text on every edit. Leave it out for a read-only view. */
  onChange?: (code: string) => void;
}

/**
 * A lightweight code editor: a transparent textarea laid exactly over the
 * highlighted code, so typing, selection, undo and paste are the browser's
 * own and the colours stay underneath. Tab indents, Shift+Tab outdents.
 * Without `onChange` it's a read-only view.
 */
export default function CodeEditor({ code, onChange }: Props) {
  const lines = code.split("\n");
  const textarea = useRef<HTMLTextAreaElement>(null);

  // Replace the selected lines' text and keep the selection on the same lines.
  const indentLines = (outdent: boolean) => {
    const el = textarea.current;
    if (!el || !onChange) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const block = value.slice(lineStart, end);
    const changed = block
      .split("\n")
      .map((l) => (outdent ? l.replace(/^ {1,2}/, "") : INDENT + l))
      .join("\n");
    const lead = block.match(/^ */)![0].length;
    const firstShift = outdent ? -Math.min(lead, INDENT.length) : INDENT.length;
    onChange(value.slice(0, lineStart) + changed + value.slice(end));
    requestAnimationFrame(() => {
      el.selectionStart = Math.max(lineStart, start + firstShift);
      el.selectionEnd = end + changed.length - block.length;
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey || el.value.slice(el.selectionStart, el.selectionEnd).includes("\n")) {
        indentLines(e.shiftKey);
      } else {
        // execCommand keeps the browser's undo stack intact.
        document.execCommand("insertText", false, INDENT);
      }
    } else if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
      // Carry the current line's indent onto the new line.
      const lineStart = el.value.lastIndexOf("\n", el.selectionStart - 1) + 1;
      const indent = el.value.slice(lineStart).match(/^ */)![0];
      e.preventDefault();
      document.execCommand("insertText", false, `\n${indent}`);
    }
  };

  return (
    <div className="flex h-full overflow-auto bg-white font-mono text-[13px] leading-6">
      {/* Gutter */}
      <div className="sticky left-0 z-10 h-max min-h-full select-none border-r border-gray-100 bg-gray-50 px-3 py-3 text-right text-gray-300">
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      {/* Code: the highlighted text, with the editable textarea on top */}
      <div className="relative h-max min-h-full min-w-0 flex-1">
        <pre aria-hidden={onChange ? true : undefined} className="m-0 w-max min-w-full py-3 pl-4 pr-6 font-mono text-gray-700">
          {lines.map((line, i) => (
            <div key={i} className="whitespace-pre">
              {line ? highlightLine(line) : " "}
            </div>
          ))}
        </pre>
        {onChange && (
          <textarea
            ref={textarea}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            wrap="off"
            aria-label="Code"
            className="absolute inset-0 m-0 h-full w-full resize-none overflow-hidden whitespace-pre border-0 bg-transparent py-3 pl-4 pr-6 font-mono text-[13px] leading-6 text-transparent caret-gray-800 outline-none selection:bg-sky-200/60"
          />
        )}
      </div>
    </div>
  );
}
