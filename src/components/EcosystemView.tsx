import { useEffect, useState } from "react";
import type { EcosystemStation, EcosystemWorkflow } from "../mock-data/ecosystem";
import type { ActivityPeriod } from "../mock-data/runs";
import { activityPeriods } from "../mock-data/runs";
import type { EcosystemSelection, LineMode } from "../ecosystem-map";
import EcosystemMap from "./EcosystemMap";
import EcosystemPanel from "./EcosystemPanel";
import SegmentedControl from "./SegmentedControl";
import PeriodPicker from "./workflow/PeriodPicker";

interface Props {
  stations: EcosystemStation[];
  workflows: EcosystemWorkflow[];
  routes?: Record<string, { col: number; row: number }[]>;
  /** Where a connected system's page is. */
  systemHref?: (id: string) => string | undefined;
  initialMode?: LineMode;
  initialSelection?: EcosystemSelection;
}

const modeOptions = [
  { id: "connections", label: "Connections" },
  { id: "workflows", label: "Workflows" },
];

/**
 * The systems page's ecosystem view: the transport map of every system and
 * the workflows between them, with what the lines stand for and the period
 * above it, and the details of whatever is picked beside it.
 */
export default function EcosystemView({ stations, workflows, routes, systemHref, initialMode = "connections", initialSelection = null }: Props) {
  const [mode, setMode] = useState<LineMode>(initialMode);
  const [period, setPeriod] = useState<ActivityPeriod>("7d");
  const [selection, setSelection] = useState<EcosystemSelection>(initialSelection);
  const hours = activityPeriods.find((p) => p.id === period)?.hours ?? 24 * 7;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelection(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <SegmentedControl variant="pill" label="Lines" options={modeOptions} value={mode} onChange={(v) => setMode(v as LineMode)} />
        <PeriodPicker compact value={period} onChange={setPeriod} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <EcosystemMap
          stations={stations}
          workflows={workflows}
          routes={routes}
          mode={mode}
          hours={hours}
          selection={selection}
          onSelect={setSelection}
        />
        <EcosystemPanel
          stations={stations}
          workflows={workflows}
          selection={selection}
          onSelect={setSelection}
          hours={hours}
          systemHref={systemHref}
        />
      </div>
    </div>
  );
}
