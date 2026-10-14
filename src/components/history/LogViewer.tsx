import { useState } from "react";
import type { LogLine } from "../../mock-data/history";
import { cn } from "../../utils/cn";
import Menu, { MenuItem } from "../Menu";
import CodeLines from "./CodeLines";
import TextPingLoader from "./TextPingLoader";

export type LogLevel = "debug" | "info" | "warn" | "error";
const levels: LogLevel[] = ["debug", "info", "warn", "error"];
const score = (l: string) => ({ debug: 0, info: 1, warn: 2, error: 3 })[l] ?? 4;

function prettify(message: string) {
  const m = message.trim();
  if ((m.startsWith("{") && m.endsWith("}")) || (m.startsWith("[") && m.endsWith("]"))) {
    try {
      return JSON.stringify(JSON.parse(m), null, 2);
    } catch {
      return message;
    }
  }
  return message;
}

/** The log level dropdown in the viewer's header (viewers.ex `log_level_filter`). */
export function LogLevelFilter({ selected, onChange }: { selected: LogLevel; onChange: (l: LogLevel) => void }) {
  return (
    <Menu
      align="end"
      className="w-32"
      trigger={
        <button
          type="button"
          aria-label="Log level"
          className="inline-flex cursor-pointer items-center gap-1 text-xs/4 @md:text-sm/6 text-inherit opacity-75 hover:opacity-100"
        >
          <span className="hero-adjustments-vertical size-4 @md:size-6" />
          <span>{selected}</span>
          <span className="hero-chevron-down size-4" aria-hidden="true" />
        </button>
      }
    >
      {levels.map((l) => (
        <MenuItem key={l} selected={l === selected} onClick={() => onChange(l)}>
          {l}
        </MenuItem>
      ))}
    </Menu>
  );
}

/**
 * A run's log (viewers.ex `log_viewer` + assets/js/log-viewer): a dark
 * slate panel with the level filter on top and Monaco-style numbered lines
 * below, each `SOURCE message`. Lines from the selected step get a yellow
 * bar. Shows "No logs were received for this run." for a finished run with
 * no logs, and a pinging "Nothing yet" while it's still going.
 */
export default function LogViewer({
  logs,
  finished,
  selectedStepId,
  waitingMessage = "Nothing yet",
  defaultLevel = "info",
  className,
}: {
  logs: LogLine[];
  /** The run is in a final state. */
  finished: boolean;
  selectedStepId?: string | null;
  waitingMessage?: string;
  defaultLevel?: LogLevel;
  className?: string;
}) {
  const [level, setLevel] = useState<LogLevel>(defaultLevel);

  if (finished && logs.length === 0) {
    return (
      <div className="m-2 relative p-12 text-center col-span-full">
        <span className="relative inline-flex">
          <div className="inline-flex">No logs were received for this run.</div>
        </span>
      </div>
    );
  }

  const visible = logs.filter((l) => score(l.level) >= score(level));
  const lines: string[] = [];
  const highlighted = new Set<number>();
  for (const log of visible) {
    for (const part of `${log.source} ${prettify(log.message)}`.split("\n")) {
      lines.push(part);
      if (selectedStepId && log.stepId === selectedStepId) highlighted.add(lines.length);
    }
  }

  return (
    <div className="flex flex-col grow rounded-md bg-slate-700 font-mono text-gray-200 @container overflow-hidden">
      <div className="border-b border-slate-500">
        <div className="mx-auto px-2">
          <div className="flex h-6 @md:h-8 flex-row-reverse items-center">
            <LogLevelFilter selected={level} onChange={setLevel} />
          </div>
        </div>
      </div>
      <div className={cn("flex grow", className)}>
        <div className="relative grow">
          {lines.length === 0 ? (
            <div className="relative text-xs @md:text-base p-12 text-center bg-slate-700 font-mono text-gray-200">
              <TextPingLoader>{waitingMessage}</TextPingLoader>
            </div>
          ) : (
            <div className="absolute inset-0 rounded-md">
              <CodeLines
                highlighted={highlighted}
                lines={lines.map((line, i) => {
                  const m = line.match(/^([A-Z/]{2,4})( .*)?$/);
                  if (!m) return <span key={i}>{line}</span>;
                  return (
                    <span key={i}>
                      {/* Monaco theme's `logSource` token: #868686 italic. */}
                      <span className="italic text-[#868686]">{m[1]}</span>
                      {m[2]}
                    </span>
                  );
                })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
