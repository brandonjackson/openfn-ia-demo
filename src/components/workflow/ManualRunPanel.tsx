import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import type { Dataclip } from "../../mock-data/history";
import { cn } from "../../utils/cn";
import CodeEditor from "./CodeEditor";
import DataclipTypePill from "../history/DataclipTypePill";
import EditorTabs from "./EditorTabs";
import InspectorLayout, { InspectorFooter } from "./InspectorLayout";
import NewRunButton from "./NewRunButton";
import { shortId } from "./editorClasses";

type Tab = "empty" | "custom" | "existing";

export interface ManualRunInput {
  kind: Tab;
  dataclipId?: string;
  body?: string;
}

interface Props {
  title: string;
  /** `standalone` floats over the canvas; `embedded` fills the IDE's right panel. */
  mode?: "standalone" | "embedded";
  dataclips: Dataclip[];
  /** Started from a path: nothing to run from. */
  fromEdge?: boolean;
  onClose: () => void;
  onRun: (input: ManualRunInput) => void;
  /** Embedded only: the X beside the tabs. */
  onClosePanel?: () => void;
  /** "Run with custom input" opens on the Custom tab. */
  initialTab?: Tab;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" });
}

/**
 * Manual run panel (ManualRunPanel.tsx + manual-run-panel/views): choose the
 * input (Empty, a custom JSON body, or an existing dataclip) and run from
 * the selected job or trigger. Standalone it is a fixed-height inspector
 * card with "Run From Here"; embedded in the IDE the header's Run is used.
 */
export default function ManualRunPanel({
  title,
  mode = "standalone",
  dataclips,
  fromEdge = false,
  onClose,
  onRun,
  onClosePanel,
  initialTab = "empty",
}: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [selected, setSelected] = useState<Dataclip | null>(null);
  const [body, setBody] = useState("");
  const [query, setQuery] = useState("");
  const [namedOnly, setNamedOnly] = useState(false);
  const embedded = mode === "embedded";

  const tabOptions = [
    { value: "empty" as const, label: "Empty", icon: "hero-document" },
    { value: "custom" as const, label: embedded ? "Custom" : "New", icon: "hero-pencil-square" },
    { value: "existing" as const, label: "Existing", icon: "hero-queue-list" },
  ];

  const q = query.trim().toLowerCase();
  const visible = dataclips
    .filter((d) => !d.wiped)
    .filter((d) => !namedOnly || d.name)
    .filter((d) => !q || d.id.startsWith(q) || (d.name ?? "").toLowerCase().includes(q))
    .slice(0, 10);

  let parseError: string | null = null;
  if (tab === "custom" && body.trim()) {
    try {
      JSON.parse(body);
    } catch (e) {
      parseError = (e as Error).message;
    }
  }

  const tabContent = (
    <>
      {tab === "empty" && (
        <div className="px-6 pt-4 pb-6">
          <div className="text-gray-500 pb-2 justify-center flex gap-1">Use an empty JSON object as the input for this run.</div>
        </div>
      )}
      {tab === "custom" && (
        <div className={cn("h-full flex flex-col", embedded ? "pt-2" : "pt-3")}>
          <div className="px-3 shrink-0">
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-4">
              <div className="flex flex-col items-center">
                <CloudArrowUpIcon className="mx-auto size-8 text-gray-300" />
                <div className="mt-2 flex flex-wrap justify-center text-sm/6 text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-semibold text-indigo-600 hover:text-indigo-500">
                    <input
                      type="file"
                      accept=".json"
                      className="opacity-0 hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void file.text().then(setBody);
                      }}
                    />
                    <span>Upload a file</span>
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs/5 text-gray-600">JSON, up to 8MB</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-sm text-gray-500 py-2">OR</span>
              </div>
            </div>
          </div>
          <div className="relative flex-1 min-h-[12rem] flex flex-col overflow-hidden">
            {parseError && (
              <div className="text-red-700 text-sm flex gap-1 mb-1 items-center px-3">
                <span className="hero-information-circle size-4" /> {parseError}
              </div>
            )}
            <CodeEditor value={body} onChange={setBody} ariaLabel="Custom input" />
          </div>
        </div>
      )}
      {tab === "existing" && (
        <div className="flex flex-col gap-3 pt-4 pb-6 px-3">
          <div className="flex items-center gap-2">
            <div className="flex flex-1">
              <div className="relative flex-1">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  autoComplete="off"
                  className="focus:ring-0 border-slate-300 block w-full rounded-l-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Search names or UUID prefixes"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="hero-magnifying-glass h-5 w-5 text-gray-400" />
                </div>
              </div>
              <button
                type="button"
                className="rounded-r-md text-sm font-semibold shadow-xs bg-primary-600 hover:bg-primary-500 text-white px-3 py-2"
              >
                Search
              </button>
            </div>
            <div className="flex gap-2">
              <button type="button" className="border border-gray-200 rounded-md px-1 py-1 h-full flex justify-center items-center hover:bg-slate-100 hover:border-slate-300" title="Filter by date created">
                <span className="hero-calendar-days w-6 h-6 text-slate-700" />
              </button>
              <button type="button" className="border border-gray-200 rounded-md px-1 py-1 h-full flex justify-center items-center hover:bg-slate-100 hover:border-slate-300" title="Filter by type">
                <span className="hero-rectangle-group w-6 h-6 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={() => setNamedOnly((n) => !n)}
                title="Named only"
                className={cn(
                  "border rounded-md px-1 py-1 h-full flex justify-center items-center hover:bg-slate-100 hover:border-slate-300",
                  namedOnly ? "bg-primary-100 border-primary-300" : "border-gray-200"
                )}
              >
                <span className="hero-tag h-5 w-5 text-slate-700" />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3 overflow-auto">
            {visible.length ? (
              visible.map((clip, i) => (
                <div
                  key={clip.id}
                  onClick={() => setSelected(clip)}
                  className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2 cursor-pointer hover:bg-slate-100 hover:border-primary-600 group"
                >
                  <div className="flex gap-2 items-center text-sm max-w-9/10">
                    <span className="flex items-center">
                      {i === 0 ? (
                        <span className="hero-star-solid size-4 text-primary-400 group-hover:text-primary-600" title="Current dataclip for this step" />
                      ) : (
                        <span className="hero-document-text size-4 group-hover:text-primary-600" />
                      )}
                    </span>
                    <span className="font-mono leading-none align-middle truncate">{clip.name || shortId(clip.id)}</span>
                    <span className="align-middle">
                      <DataclipTypePill type={clip.type} size="small" />
                    </span>
                  </div>
                  <div className="text-xs truncate ml-2">{formatDate(clip.insertedAt)}</div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm">No dataclips match the filter.</div>
            )}
            {visible.length > 0 && (
              <div className="text-center text-sm text-gray-600">Search results are limited to the 10 most recent matches for this step.</div>
            )}
          </div>
        </div>
      )}
    </>
  );

  const selectedView = selected && (
    <div className="flex flex-col h-full">
      <div className={cn("flex items-center justify-between pb-4", embedded ? "px-3 pt-3" : "px-6 pt-4")}>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{selected.name || "Unnamed"}</h3>
            <button type="button" className="text-gray-400 hover:text-gray-600" title="Rename">
              <span className="hero-pencil h-4 w-4 block" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span className="capitalize">{selected.type.replace("_", " ")}</span>
            <span>•</span>
            <span>{new Date(selected.insertedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <button type="button" onClick={() => setSelected(null)} className="ml-4 text-gray-400 hover:text-gray-600" aria-label="Unselect dataclip">
          <span className="hero-x-mark h-5 w-5 block" />
        </button>
      </div>
      <div className="flex-1 min-h-[16rem]">
        <CodeEditor value={JSON.stringify(selected.body, null, 2)} readOnly ariaLabel="Dataclip body" />
      </div>
    </div>
  );

  const edgeMessage = (
    <div className="flex justify-center flex-col items-center self-center h-full">
      <div className="text-gray-600">Select a Step or Trigger to start a Run from</div>
    </div>
  );

  const run = () => onRun(selected ? { kind: "existing", dataclipId: selected.id } : { kind: tab, body });

  if (embedded) {
    return (
      <div className="flex flex-col h-full" data-annotation="workflow-editor-manual-run">
        {!selected && !fromEdge && (
          <div className="shrink-0">
            <div className="flex items-center justify-between px-3 pt-2 pb-1">
              <div className="flex-1">
                <EditorTabs variant="pills" value={tab} onChange={setTab} options={tabOptions} />
              </div>
              {onClosePanel && (
                <div className="flex items-center pl-2">
                  <button type="button" onClick={onClosePanel} className="p-1 hover:bg-gray-100 rounded transition-colors" aria-label="Close panel" title="Close panel">
                    <span className="hero-x-mark h-4 w-4 text-gray-500 block" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex-1 overflow-auto">{fromEdge ? edgeMessage : selected ? selectedView : <div className="flex flex-col h-full min-h-0">{tabContent}</div>}</div>
      </div>
    );
  }

  return (
    <InspectorLayout
      title={title}
      onClose={onClose}
      fixedHeight
      showBackButton
      annotation="workflow-editor-manual-run"
      footer={<InspectorFooter rightButtons={<NewRunButton onClick={run} text="Run From Here" disabled={fromEdge || !!parseError} />} />}
    >
      {fromEdge ? (
        edgeMessage
      ) : selected ? (
        selectedView
      ) : (
        <div className="flex flex-col h-full min-h-0 flex-1 mt-4">
          <EditorTabs className="mx-3" variant="pills" value={tab} onChange={setTab} options={tabOptions} />
          {tabContent}
        </div>
      )}
    </InspectorLayout>
  );
}
