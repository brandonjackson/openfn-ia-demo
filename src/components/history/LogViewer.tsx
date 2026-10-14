import { useEffect, useRef, useState } from "react";
import type { LogLine } from "../../mock-data/history";
import { cn } from "../../utils/cn";
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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="z-50" ref={ref}>
      <div className="relative">
        <button
          type="button"
          className="grid w-full cursor-pointer grid-cols-1 bg-inherit text-left text-xs/4 @md:text-sm/6 text-inherit opacity-75 hover:opacity-100"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="col-start-1 row-start-1 truncate pr-6">
            <span className="hero-adjustments-vertical size-4 @md:size-6 align-middle" />{" "}
            <span className="align-middle">{selected}</span>
          </span>
          <span className="hero-chevron-down col-start-1 row-start-1 size-4 self-center justify-self-end" aria-hidden="true" />
        </button>
        {open && (
          <ul
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-slate-600 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
            role="listbox"
          >
            {levels.map((l) => (
              <li
                key={l}
                role="option"
                aria-selected={l === selected}
                className="relative cursor-default select-none py-2 pl-8 pr-4 hover:bg-slate-500"
                onClick={() => {
                  onChange(l);
                  setOpen(false);
                }}
              >
                <span className={cn("block truncate", l === selected ? "font-semibold" : "font-normal")}>{l}</span>
                {l === selected && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-blue-400">
                    <span className="hero-check size-5 font-semibold" aria-hidden="true" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
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
