/**
 * The organisation's ecosystem map on the pretend server: its systems as
 * stations placed on a grid, and the workflows between them. Lightning's API
 * has nothing like it (it's the demo's), so it lives under `/api/demo/` and
 * follows api/conventions.md.
 *
 * Read only. The map is placed by hand (`src/fixtures/ecosystem.ts`); a
 * system on it is named by its id, as the connected-systems routes have it,
 * and by its name there now. A system deleted since leaves the map, with
 * every workflow that walks through it.
 */
import { ecosystemRoutes, ecosystemStations, ecosystemWorkflows } from "../fixtures/ecosystem";
import { apiSystemId, apiWorkflowId, seedId } from "../fixtures/ids";
import type { EcosystemStation } from "../model/ecosystem";
import { json, type Handler } from "./answers";

interface StationAttributes {
  id: string;
  name: string;
  adaptor: string | null;
  col: number;
  row: number;
  kind: EcosystemStation["kind"];
  owner: string | null;
  xroad: EcosystemStation["xroad"] | null;
}
import { systems } from "./connected-systems";

export const ecosystemRoutesTable: Record<string, Handler> = {
  "GET /api/demo/ecosystem": () => {
    const rows = systems.rows();
    // A system's station is named by its id on the API; a member calling in keeps its directory name.
    const ids = new Map<string, string>();
    const stations = ecosystemStations.flatMap((s): StationAttributes[] => {
      if (s.kind === "client") {
        ids.set(s.id, s.id);
        return [{ id: s.id, name: s.name, adaptor: s.adaptor ?? null, col: s.col, row: s.row, kind: s.kind, owner: s.owner ?? null, xroad: s.xroad ?? null }];
      }
      const system = rows.find((r) => r.id === apiSystemId(s.id));
      if (!system) return [];
      ids.set(s.id, system.id);
      return [{ id: system.id, name: system.name, adaptor: system.adaptor, col: s.col, row: s.row, kind: s.kind, owner: system.owner, xroad: s.xroad ?? null }];
    });
    const workflows = ecosystemWorkflows
      .filter((w) => w.stations.every((id) => ids.has(id)))
      .map((w) => ({
        id: apiWorkflowId(w.id),
        name: w.name,
        project: w.project,
        trigger: w.trigger,
        trigger_detail: w.triggerDetail,
        state: w.state,
        station_ids: w.stations.map((id) => ids.get(id)!),
        runs_per_day: w.runsPerDay,
        success_rate: w.successRate,
        fails_at: w.failsAt ?? null,
        failure_reason: w.failureReason ?? null,
        note: w.note ?? null,
        color: w.color,
      }));
    // Corners are keyed by the link's two station ids, sorted; they're renamed with their stations.
    // Each runs from the first station id, in sorted order, to the second.
    const corners = Object.entries(ecosystemRoutes).flatMap(([key, via]) => {
      const [a, b] = key.split("|").map((id) => ids.get(id));
      if (!a || !b) return [];
      return [a < b ? { station_ids: [a, b], via } : { station_ids: [b, a], via: [...via].reverse() }];
    });
    return json(200, { data: { type: "ecosystems", id: seedId("ecosystem", "organization"), attributes: { stations, workflows, corners } } });
  },
};
