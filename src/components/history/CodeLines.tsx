import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/**
 * A read-only, Monaco-styled code area: Lightning renders logs and
 * dataclips in Monaco with its "default" theme (assets/js/monaco/index.tsx:
 * vs-dark base on slate-700, slate-600 current line). This draws the same
 * gutter, line height and colours without the editor.
 */
export default function CodeLines({
  lines,
  highlighted,
  className,
}: {
  /** Already-tokenised lines. */
  lines: ReactNode[];
  /** 1-based line numbers to mark with the yellow step bar. */
  highlighted?: Set<number>;
  className?: string;
}) {
  return (
    <div
      className={cn("h-full overflow-auto bg-slate-700 text-slate-200 text-[14px] leading-[19px] py-0", className)}
      style={{ fontFamily: "'Fira Code', 'Fira Code VF', ui-monospace, monospace", fontVariantLigatures: "normal" }}
    >
      <div className="min-w-full w-max">
        {lines.map((line, i) => (
          <div key={i} className={cn("flex", i === 0 && "bg-slate-600")}>
            {/* Monaco's line number gutter (lineNumbersMinChars: 3) */}
            <span
              className={cn(
                "w-[3ch] shrink-0 text-right select-none ml-[0.6ch]",
                i === 0 ? "text-[#c6c6c6]" : "text-[#858585]"
              )}
            >
              {i + 1}
            </span>
            {/* Line decorations column, where the step highlight bar sits. */}
            <span className="w-[2.6ch] shrink-0 relative">
              {highlighted?.has(i + 1) && <span className="absolute inset-y-0 left-1 w-0.5 bg-yellow-400" />}
            </span>
            <span className="whitespace-pre-wrap break-all pr-4">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
