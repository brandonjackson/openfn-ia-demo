import { useState, type ReactNode } from "react";
import CodeLines from "./CodeLines";

// Monaco vs-dark JSON token colours, with bracket-pair colourisation. The
// values are Monaco's own, which Lightning's dataclip viewer inherits.
const KEY = "text-[#9CDCFE]";
const STRING = "text-[#CE9178]";
const NUMBER = "text-[#B5CEA8]";
const KEYWORD = "text-[#569CD6]";
const BRACKETS = ["text-[#FFD700]", "text-[#DA70D6]", "text-[#179FFF]"];

function tokenise(line: string, depth: { n: number }): ReactNode {
  const out: ReactNode[] = [];
  const indent = line.match(/^ */)![0].length;
  for (let i = 0; i < indent / 2; i++) {
    // Indent guides.
    out.push(<span key={`g${i}`} className="inline-block w-[2ch] border-l border-[#65737F]/60 h-[19px] align-top" />);
  }
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false|null)|([{}[\]])|([,:])|(\s+)/g;
  let m: RegExpExecArray | null;
  let k = 0;
  const rest = line.slice(indent);
  while ((m = re.exec(rest))) {
    if (m[1]) {
      out.push(
        <span key={k++} className={m[2] ? KEY : STRING}>
          {m[1]}
        </span>
      );
      if (m[2]) out.push(<span key={k++}>{m[2]}</span>);
    } else if (m[3]) out.push(<span key={k++} className={NUMBER}>{m[3]}</span>);
    else if (m[4]) out.push(<span key={k++} className={KEYWORD}>{m[4]}</span>);
    else if (m[5]) {
      const open = m[5] === "{" || m[5] === "[";
      if (!open) depth.n--;
      out.push(
        <span key={k++} className={BRACKETS[((depth.n % 3) + 3) % 3]}>
          {m[5]}
        </span>
      );
      if (open) depth.n++;
    } else out.push(<span key={k++}>{m[6] ?? m[7]}</span>);
  }
  return <>{out}</>;
}

/**
 * A dataclip body in the dark code viewer (react/components/CodeViewer.tsx,
 * DataclipViewer.tsx): pretty-printed JSON with a copy button in the
 * top-right corner.
 */
export default function JsonViewer({ value }: { value: unknown }) {
  const [copied, setCopied] = useState(false);
  const content = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  const depth = { n: 0 };
  const lines = content.split("\n").map((l) => tokenise(l, depth));

  return (
    <div className="h-full relative">
      {content && (
        <button
          onClick={(e) => {
            e.currentTarget.blur();
            void navigator.clipboard?.writeText(content).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
          className="absolute top-3 right-3 z-10 p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 focus:outline-none transition-colors"
          title={copied ? "Copied!" : "Copy to clipboard"}
          aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
        >
          {copied ? (
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>
      )}
      <CodeLines lines={lines} />
    </div>
  );
}
