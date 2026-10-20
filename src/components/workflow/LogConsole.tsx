import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { LogLine } from "../../mock-data/workflow";

const sourceColor: Record<LogLine["source"], string> = {
  RTE: "text-sky-300",
  VER: "text-violet-300",
  "R/T": "text-emerald-300",
  ADA: "text-amber-300",
  JOB: "text-gray-300",
};

/**
 * The dark, line-numbered log console shown beneath the run inspector.
 * Each line is tagged with its source (RTE / VER / R/T / ADA).
 */
export default function LogConsole({ lines }: { lines: LogLine[] }) {
  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-700 px-3 py-1.5">
        <span className="text-xs text-slate-400">Logs</span>
        <button className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200">
          <SlidersHorizontal size={12} />
          info
          <ChevronDown size={12} />
        </button>
      </div>
      <div className="flex-1 overflow-auto py-2 font-mono text-[12px] leading-5">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3 px-3 hover:bg-slate-800/60">
            <span className="w-6 select-none text-right text-slate-600">{i + 1}</span>
            <span className={`w-8 flex-shrink-0 ${sourceColor[line.source]}`}>
              {line.source}
            </span>
            <span className="whitespace-pre text-slate-200">{line.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
