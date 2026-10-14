import { useRef, useState } from "react";
import { cn } from "../../utils/cn";

interface Props {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  /** Monospace size; Monaco's default is 14px on 19px lines. */
  ariaLabel?: string;
}

const LINE = 19;

/**
 * Stand-in for Lightning's Monaco editor (CollaborativeMonaco.tsx with the
 * "default" theme): slate-700 background, slate line numbers, the current
 * line highlighted. A plain textarea, so no autocomplete or syntax colours.
 */
export default function CodeEditor({ value, onChange, readOnly = false, className, ariaLabel = "Job code" }: Props) {
  const [line, setLine] = useState(0);
  const [scroll, setScroll] = useState(0);
  const ref = useRef<HTMLTextAreaElement>(null);
  const lines = Math.max(1, value.split("\n").length);
  const track = () => {
    const el = ref.current;
    if (el) setLine(el.value.slice(0, el.selectionStart).split("\n").length - 1);
  };
  return (
    <div className={cn("relative flex h-full w-full overflow-hidden bg-slate-700 font-mono text-sm", className)}>
      <div className="shrink-0 w-16 select-none text-right pr-6 pt-0 overflow-hidden" aria-hidden="true">
        <div style={{ transform: `translateY(${-scroll}px)` }}>
          {Array.from({ length: lines }, (_, i) => (
            <div key={i} style={{ height: LINE, lineHeight: `${LINE}px` }} className={i === line ? "text-slate-100" : "text-slate-400"}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>
      <div className="relative flex-1 min-w-0">
        <div
          className="absolute left-0 right-0 bg-slate-600 pointer-events-none"
          style={{ top: line * LINE - scroll, height: LINE }}
          aria-hidden="true"
        />
        <textarea
          ref={ref}
          value={value}
          readOnly={readOnly}
          spellCheck={false}
          aria-label={ariaLabel}
          onChange={(e) => {
            onChange?.(e.target.value);
            track();
          }}
          onSelect={track}
          onKeyUp={track}
          onClick={track}
          onScroll={(e) => setScroll(e.currentTarget.scrollTop)}
          onKeyDown={(e) => {
            if (e.key === "Tab" && !readOnly) {
              e.preventDefault();
              const el = e.currentTarget;
              const { selectionStart: s, selectionEnd: end } = el;
              onChange?.(value.slice(0, s) + "  " + value.slice(end));
              requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
            }
          }}
          className="relative block h-full w-full resize-none border-0 bg-transparent p-0 text-slate-200 caret-slate-100 focus:outline-none focus:ring-0 whitespace-pre-wrap"
          style={{ lineHeight: `${LINE}px`, fontSize: 14, fontVariantLigatures: "none" }}
        />
      </div>
    </div>
  );
}
