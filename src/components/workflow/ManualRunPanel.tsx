import { useState } from "react";
import type { Dataclip } from "../../mock-data/history";
import { cn } from "../../utils/cn";
import DataclipTypePill from "../history/DataclipTypePill";
import Button from "../Button";
import Card from "../Card";
import Heading from "../Heading";
import IconButton from "../IconButton";
import { FieldError } from "../Inputs";
import CodeEditor from "./CodeEditor";
import Tabs from "../Tabs";
import InspectorLayout, { InspectorFooter } from "./InspectorLayout";
import NewRunButton from "./NewRunButton";
import SearchInput from "../SearchInput";
import { matchesQuery } from "../../utils/search";
import { formatLocalDate, formatShortLocalDateTime, shortUuid } from "../../utils/format";
import { uuidOf } from "../../mock-data/history-extra";

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
    { id: "empty" as const, label: "Empty", icon: "hero-document" },
    { id: "custom" as const, label: embedded ? "Custom" : "New", icon: "hero-pencil-square" },
    { id: "existing" as const, label: "Existing", icon: "hero-queue-list" },
  ];

  const visible = dataclips
    .filter((d) => !d.wiped)
    .filter((d) => !namedOnly || d.name)
    .filter((d) => d.id.startsWith(query.trim().toLowerCase()) || matchesQuery(query, d.name))
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
      {tab === "empty" && <p className="px-6 pt-4 pb-8 text-center text-gray-500">Use an empty JSON object as the input for this run.</p>}
      {tab === "custom" && (
        <div className={cn("flex h-full flex-col", embedded ? "pt-2" : "pt-3")}>
          <div className="shrink-0 px-3">
            <Card dashed padding="sm" className="mt-2 flex flex-col items-center text-sm/6 text-gray-600">
              <span className="hero-cloud-arrow-up size-8 text-gray-300" />
              <p className="mt-2">
                <label className="link font-semibold">
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void file.text().then(setBody);
                    }}
                  />
                  Upload a file
                </label>{" "}
                or drag and drop
              </p>
              <p className="text-xs/5">JSON, up to 8MB</p>
            </Card>
            <div className="flex items-center gap-2 py-2 text-sm text-gray-500 *:h-px *:flex-1 *:bg-gray-300" aria-hidden="true">
              <span />
              OR
              <span />
            </div>
          </div>
          <div className="flex min-h-48 flex-1 flex-col overflow-hidden">
            {parseError && (
              <div className="px-3">
                <FieldError>{parseError}</FieldError>
              </div>
            )}
            <CodeEditor value={body} onChange={setBody} ariaLabel="Custom input" />
          </div>
        </div>
      )}
      {tab === "existing" && (
        <div className="flex flex-col gap-3 px-3 pt-4 pb-6 text-sm">
          <div className="flex items-center gap-2">
            <SearchInput value={query} onChange={setQuery} placeholder="Search names or UUID prefixes" size="sm" className="flex-1" />
            <Button>Search</Button>
            <IconButton icon="hero-calendar-days" label="Filter by date created" />
            <IconButton icon="hero-rectangle-group" label="Filter by type" />
            <IconButton icon="hero-tag" label="Named only" active={namedOnly} aria-pressed={namedOnly} onClick={() => setNamedOnly((n) => !n)} />
          </div>
          <div className="flex flex-col gap-3 overflow-auto">
            {visible.length ? (
              visible.map((clip, i) => (
                <Card
                  key={clip.id}
                  as="button"
                  padding="none"
                  onClick={() => setSelected(clip)}
                  className="group flex items-center justify-between gap-2 rounded-md px-3 py-2 shadow-none hover:border-primary-600 hover:bg-gray-100 hover:shadow-none"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {i === 0 ? (
                      <span className="hero-star-solid size-4 shrink-0 text-primary-400 group-hover:text-primary-600" title="Current dataclip for this step" />
                    ) : (
                      <span className="hero-document-text size-4 shrink-0 group-hover:text-primary-600" />
                    )}
                    <span className="truncate font-mono">{clip.name || shortUuid(uuidOf(clip.id), 7)}</span>
                    <DataclipTypePill type={clip.type} />
                  </div>
                  <span className="truncate text-xs">{formatShortLocalDateTime(clip.insertedAt)}</span>
                </Card>
              ))
            ) : (
              <p className="text-center">No dataclips match the filter.</p>
            )}
            {visible.length > 0 && <p className="text-center text-gray-600">Search results are limited to the 10 most recent matches for this step.</p>}
          </div>
        </div>
      )}
    </>
  );

  const selectedView = selected && (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center justify-between gap-4 pb-4", embedded ? "px-3 pt-3" : "px-6 pt-4")}>
        <div>
          <div className="flex items-center gap-2">
            <Heading>{selected.name || "Unnamed"}</Heading>
            <IconButton icon="hero-pencil" label="Rename" size="sm" />
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <span className="capitalize">{selected.type.replace("_", " ")}</span>
            <span>•</span>
            <span>{formatLocalDate(selected.insertedAt)}</span>
          </div>
        </div>
        <IconButton icon="hero-x-mark" label="Unselect dataclip" onClick={() => setSelected(null)} />
      </div>
      <div className="min-h-64 flex-1">
        <CodeEditor value={JSON.stringify(selected.body, null, 2)} readOnly ariaLabel="Dataclip body" />
      </div>
    </div>
  );

  const edgeMessage = <p className="flex h-full items-center justify-center text-gray-600">Select a Step or Trigger to start a Run from</p>;

  const run = () => onRun(selected ? { kind: "existing", dataclipId: selected.id } : { kind: tab, body });

  if (embedded) {
    return (
      <div className="flex h-full flex-col" data-annotation="workflow-editor-manual-run">
        {!selected && !fromEdge && (
          <Tabs
            variant="pill"
            fill
            className="shrink-0 px-3 pt-2 pb-1"
            tabs={tabOptions}
            active={tab}
            onChange={setTab}
            after={onClosePanel && <IconButton icon="hero-x-mark" label="Close panel" size="sm" onClick={onClosePanel} />}
          />
        )}
        <div className="flex-1 overflow-auto">{fromEdge ? edgeMessage : selected ? selectedView : <div className="flex h-full min-h-0 flex-col">{tabContent}</div>}</div>
      </div>
    );
  }

  return (
    <InspectorLayout
      title={title}
      onClose={onClose}
      fixedHeight
      bare
      showBackButton
      annotation="workflow-editor-manual-run"
      footer={<InspectorFooter rightButtons={<NewRunButton onClick={run} text="Run From Here" disabled={fromEdge || !!parseError} />} />}
    >
      {fromEdge ? (
        edgeMessage
      ) : selected ? (
        selectedView
      ) : (
        <div className="mt-4 flex h-full min-h-0 flex-col">
          <Tabs variant="pill" fill className="mx-3" tabs={tabOptions} active={tab} onChange={setTab} />
          {tabContent}
        </div>
      )}
    </InspectorLayout>
  );
}
