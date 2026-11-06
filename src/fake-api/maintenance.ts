/*
 * The instance's maintenance jobs, on the demo's own routes: api/ has none
 * (docs/api-gaps.md). Superusers only, as Lightning's /settings/maintenance.
 *
 *   GET  /api/demo/maintenance            the jobs, with when each last ran
 *   POST /api/demo/maintenance/:id/run    runs one; answers 200 with the job as it now stands
 */
import { maintenanceTasks } from "../fixtures/admin";
import { seedId } from "../fixtures/ids";
import { badId, forbidden, isUuid, json, notFound, now, paged, type Handler } from "./answers";
import { table } from "./db";
import { currentUserId } from "./session";
import { findUser } from "./users";

interface MaintenanceRow {
  id: string;
  /** Which job it is, for what it reports. Not sent. */
  key: string;
  title: string;
  description: string;
  last_run_at: string | null;
  last_run_result: string | null;
}

const jobs = table<MaintenanceRow>("maintenance", () =>
  maintenanceTasks.map((t) => ({
    id: seedId("maintenance_job", t.id),
    key: t.id,
    title: t.title,
    description: t.description,
    last_run_at: t.lastRun?.at ?? null,
    last_run_result: t.lastRun?.result ?? null,
  })),
);

/** What each job reports when it finishes. */
const results: Record<string, string> = {
  "refresh-adaptors": "214 adaptors, 2 new versions",
  "refresh-icons": "3 updated, 211 unchanged",
};

/** A job as the routes send it: everything but its key. */
const entry = (j: MaintenanceRow) => ({ id: j.id, title: j.title, description: j.description, last_run_at: j.last_run_at, last_run_result: j.last_run_result });

const isSuperuser = () => findUser(currentUserId())?.role === "superuser";

export const maintenanceRoutes: Record<string, Handler> = {
  "GET /api/demo/maintenance": (_params, _body, query) => {
    if (!isSuperuser()) return forbidden();
    return json(200, paged("/api/demo/maintenance", jobs.rows().map(entry), query));
  },
  "POST /api/demo/maintenance/:id/run": ({ id }) => {
    if (!isSuperuser()) return forbidden();
    if (!isUuid(id)) return badId("/api/demo/maintenance/:id/run");
    if (!jobs.rows().some((j) => j.id === id)) return notFound();
    jobs.update(
      (j) => j.id === id,
      (j) => ({ ...j, last_run_at: now(), last_run_result: results[j.key] ?? "Done" }),
    );
    return json(200, { data: entry(jobs.rows().find((j) => j.id === id)!) });
  },
};
