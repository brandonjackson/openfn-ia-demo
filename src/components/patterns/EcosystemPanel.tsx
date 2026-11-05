import type { ReactNode } from "react";
import { ArrowLeftRight, X } from "lucide-react";
import type { EcosystemStation, EcosystemWorkflow } from "../../model/ecosystem";
import { triggerTypes } from "../../model/workflow";
import type { EcosystemSelection, Traffic } from "../../model/ecosystem-map";
import { buildLinks, healthOf, healthStyles, lineColors, linkTraffic, stationTraffic, successPercent, sumTraffic, workflowTraffic, workflowsAt } from "../../model/ecosystem-map";
import AdaptorLogo from "../domain/AdaptorLogo";
import Badge from "../primitives/Badge";
import ConnectionMethodBadge from "../domain/ConnectionMethodBadge";
import IconButton from "../primitives/IconButton";
import StatTile from "../primitives/StatTile";
import Surface from "../primitives/Surface";
import TextLink from "../primitives/TextLink";
import XRoadAccessBadge from "../domain/XRoadAccessBadge";

interface Props {
  stations: EcosystemStation[];
  workflows: EcosystemWorkflow[];
  selection: EcosystemSelection;
  onSelect: (selection: EcosystemSelection) => void;
  /** How far back the numbers look, in hours. */
  hours: number;
  /** Where a connected system's page is, e.g. `/connected-systems/dhis2`. */
  systemHref?: (id: string) => string | undefined;
}

const num = (n: number) => n.toLocaleString("en-GB");

/** Runs, failures and success rate, as a row of compact tiles. */
function TrafficTiles({ traffic, failedLabel = "Failed" }: { traffic: Traffic; failedLabel?: string }) {
  const rate = successPercent(traffic);
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatTile bare label="Runs" value={num(traffic.runs)} />
      <StatTile bare label={failedLabel} value={num(traffic.failed)} danger={traffic.failed > 0} />
      <StatTile bare label="Success" value={rate === null ? "–" : `${rate}%`} />
    </div>
  );
}

/** A workflow as a row: its line colour, name and runs. Picks it on the map. */
function WorkflowItem({ wf, hours, onSelect }: { wf: EcosystemWorkflow; hours: number; onSelect: () => void }) {
  const t = workflowTraffic(wf, hours);
  const health = healthOf(t);
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-gray-50"
      >
        <span className={`h-1 w-4 flex-shrink-0 rounded-full ${wf.state === "draft" ? "bg-gray-300" : lineColors[wf.color].bg}`} />
        <span className="min-w-0 flex-1 truncate text-sm text-gray-800">{wf.name}</span>
        {wf.state === "draft" ? (
          <span className="text-xs text-gray-400">Draft</span>
        ) : (
          <span className={`text-xs tabular-nums ${health === "failing" ? "text-red-600" : "text-gray-500"}`}>{num(t.runs)}</span>
        )}
      </button>
    </li>
  );
}

function Heading({ title, detail, onClose }: { title: ReactNode; detail?: ReactNode; onClose?: () => void }) {
  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {detail && <p className="mt-0.5 text-xs text-gray-500">{detail}</p>}
      </div>
      {onClose && <IconButton icon={X} label="Back to the whole ecosystem" size="sm" onClick={onClose} />}
    </div>
  );
}

/**
 * The details beside the ecosystem map: the whole ecosystem when nothing is
 * picked, or the picked workflow (as a line diagram, trigger first), system
 * or link between two systems.
 */
export default function EcosystemPanel({ stations, workflows, selection, onSelect, hours, systemHref }: Props) {
  const byId = new Map(stations.map((s) => [s.id, s]));
  const clear = () => onSelect(null);
  const sortByRuns = (list: EcosystemWorkflow[]) =>
    [...list].sort((a, b) => workflowTraffic(b, hours).runs - workflowTraffic(a, hours).runs || (a.state === "draft" ? 1 : -1));

  let body: ReactNode;

  if (selection?.type === "workflow") {
    const wf = workflows.find((w) => w.id === selection.id);
    if (!wf) return null;
    const t = workflowTraffic(wf, hours);
    const Trigger = triggerTypes[wf.trigger].icon;
    const colour = wf.state === "draft" ? "bg-gray-300" : lineColors[wf.color].bg;
    body = (
      <>
        <Heading title={wf.name} detail={wf.project} onClose={clear} />
        <div className="flex flex-wrap gap-1.5">
          <Badge label={wf.state === "draft" ? "Draft" : "Live"} tone={wf.state === "draft" ? "gray" : "green"} />
          {wf.state === "live" && healthOf(t) !== "healthy" && (
            <Badge label={healthStyles[healthOf(t)].label} tone={healthOf(t) === "failing" ? "red" : "yellow"} />
          )}
        </div>
        {wf.note && <p className="text-xs text-gray-500">{wf.note}</p>}
        {wf.state === "live" && <TrafficTiles traffic={t} />}
        <ol aria-label="Stations">
          <li className="flex gap-3">
            <div className="flex w-5 flex-col items-center">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <Trigger size={11} />
              </span>
              <span className={`w-1 flex-1 ${colour}`} />
            </div>
            <p className="pb-3 text-xs text-gray-500">{wf.triggerDetail}</p>
          </li>
          {wf.stations.map((id, i) => {
            const s = byId.get(id);
            const last = i === wf.stations.length - 1;
            const failsHere = wf.failsAt === i && t.failed > 0;
            return (
              <li key={`${id}-${i}`} className="flex gap-3">
                <div className="flex w-5 flex-col items-center">
                  <span className={`w-1 flex-none h-1 ${colour}`} />
                  <span className={`h-3 w-3 flex-none rounded-full border-2 bg-white ${failsHere ? "border-red-500" : "border-gray-700"}`} />
                  {!last && <span className={`w-1 flex-1 ${colour}`} />}
                </div>
                <button
                  type="button"
                  onClick={() => onSelect({ type: "station", id })}
                  className={`-mt-1 flex min-w-0 flex-1 items-start gap-2 rounded-md px-1 py-1 text-left hover:bg-gray-50 ${last ? "" : "mb-2"}`}
                >
                  <AdaptorLogo adaptor={s?.adaptor} name={s?.name} size="xs" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-gray-800">{s?.name ?? id}</span>
                    {failsHere && (
                      <span className="block text-xs text-red-600">
                        {num(t.failed)} failed here: {wf.failureReason}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <TextLink variant="action" to={`/workflow-editor/${wf.id}`}>
          Open in the editor
        </TextLink>
      </>
    );
  } else if (selection?.type === "station") {
    const s = byId.get(selection.id);
    if (!s) return null;
    const through = sortByRuns(workflowsAt(s.id, workflows));
    const href = s.kind === "system" ? systemHref?.(s.id) : undefined;
    body = (
      <>
        <div className="flex items-start gap-3">
          <AdaptorLogo adaptor={s.adaptor} name={s.name} size="lg" />
          <div className="min-w-0 flex-1">
            <Heading title={s.name} detail={s.owner} onClose={clear} />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {s.kind === "client" ? (
            <Badge label="Calls your service over X-Road" tone="indigo" />
          ) : (
            <ConnectionMethodBadge method={s.xroad ? "xroad" : "direct"} />
          )}
          {s.kind === "system" && s.xroad && <XRoadAccessBadge status={s.xroad.status} />}
        </div>
        <TrafficTiles traffic={stationTraffic(s.id, workflows, hours)} failedLabel="Failed here" />
        <div>
          <p className="mb-1 text-xs font-medium text-gray-500">
            {through.length} workflow{through.length === 1 ? "" : "s"} through here
          </p>
          <ul>
            {through.map((wf) => (
              <WorkflowItem key={wf.id} wf={wf} hours={hours} onSelect={() => onSelect({ type: "workflow", id: wf.id })} />
            ))}
          </ul>
        </div>
        {href && (
          <TextLink variant="action" to={href}>
            Open {s.name}
          </TextLink>
        )}
      </>
    );
  } else if (selection?.type === "link") {
    const link = buildLinks(workflows).find((l) => l.id === selection.id);
    if (!link) return null;
    const a = byId.get(link.a);
    const b = byId.get(link.b);
    const on = sortByRuns(workflows.filter((w) => link.workflowIds.includes(w.id)));
    body = (
      <>
        <div className="flex items-center gap-2">
          <AdaptorLogo adaptor={a?.adaptor} name={a?.name} size="sm" />
          <ArrowLeftRight size={14} className="text-gray-400" />
          <AdaptorLogo adaptor={b?.adaptor} name={b?.name} size="sm" />
          <div className="flex-1" />
          <IconButton icon={X} label="Back to the whole ecosystem" size="sm" onClick={clear} />
        </div>
        <Heading title={`${a?.name} and ${b?.name}`} detail="Every workflow that moves data between them" />
        <TrafficTiles traffic={linkTraffic(link, workflows, hours)} />
        <ul>
          {on.map((wf) => (
            <WorkflowItem key={wf.id} wf={wf} hours={hours} onSelect={() => onSelect({ type: "workflow", id: wf.id })} />
          ))}
        </ul>
      </>
    );
  } else {
    const total = sumTraffic(workflows.map((w) => workflowTraffic(w, hours)));
    const live = workflows.filter((w) => w.state === "live").length;
    body = (
      <>
        <Heading
          title="Your ecosystem"
          detail={`${stations.length} systems and ${live} live workflow${live === 1 ? "" : "s"}. Pick a system, line or workflow to see its details.`}
        />
        <TrafficTiles traffic={total} />
        <ul>
          {sortByRuns(workflows).map((wf) => (
            <WorkflowItem key={wf.id} wf={wf} hours={hours} onSelect={() => onSelect({ type: "workflow", id: wf.id })} />
          ))}
        </ul>
      </>
    );
  }

  return (
    <Surface variant="raised" as="aside" className="flex flex-col gap-4 p-4">
      {body}
    </Surface>
  );
}
