import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { LogLine } from "../../mock-data/workflow";

const sourceColor: Record<"dark" | "light", Record<LogLine["source"], string>> = {
  dark: {
    RTE: "text-sky-300",
    VER: "text-violet-300",
    "R/T": "text-emerald-300",
    ADA: "text-amber-300",
    JOB: "text-gray-300",
  },
  light: {
    RTE: "text-sky-700",
    VER: "text-violet-700",
    "R/T": "text-emerald-700",
    ADA: "text-amber-700",
    JOB: "text-gray-500",
  },
};

/**
 * The line-numbered log console. Each line is tagged with its source
 * (RTE / VER / R/T / ADA).
 *
 * `dark` (the default) has its own header with the log level; `light` is
 * header-less, for sitting inside an editor tray that already has one.
 */
export default function LogConsole({ lines, tone = "dark" }: { lines: LogLine[]; tone?: "dark" | "light" }) {
  const dark = tone === "dark";
  return (
    <div className={`flex h-full flex-col ${dark ? "bg-slate-900 text-slate-100" : "bg-white text-gray-800"}`}>
      {dark && (
        <div className="flex items-center justify-between border-b border-slate-700 px-3 py-1.5">
          <span className="text-xs text-slate-400">Logs</span>
          <button className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200">
            <SlidersHorizontal size={12} />
            info
            <ChevronDown size={12} />
          </button>
        </div>
      )}
      <div className="flex-1 overflow-auto py-2 font-mono text-[12px] leading-5">
        {lines.length === 0 && <p className={`px-3 ${dark ? "text-slate-500" : "text-gray-400"}`}>No log lines.</p>}
        {lines.map((line, i) => (
          <div key={i} className={`flex gap-3 px-3 ${dark ? "hover:bg-slate-800/60" : "hover:bg-gray-50"}`}>
            <span className={`w-6 select-none text-right ${dark ? "text-slate-600" : "text-gray-300"}`}>{i + 1}</span>
            <span className={`w-8 flex-shrink-0 ${sourceColor[tone][line.source]}`}>{line.source}</span>
            <span className={`whitespace-pre ${dark ? "text-slate-200" : "text-gray-700"}`}>{line.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
