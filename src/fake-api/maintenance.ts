/*
 * The instance's maintenance jobs, on the demo's own routes: api/ has none
 * (docs/api-gaps.md). Superusers only, as Lightning's /settings/maintenance.
 *
 *   GET  /api/demo/maintenance            the jobs, with when each last ran
 *   POST /api/demo/maintenance/:id/runs   runs one; answers with the job as it now stands
 */
import { maintenanceTasks } from "../fixtures/admin";
import { forbidden, json, notFound, now, paged, type Handler } from "./answers";
import { table } from "./db";
import { currentUserId } from "./session";
import { findUser } from "./users";

interface MaintenanceRow {
  id: string;
  title: string;
  description: string;
  last_run_at: string | null;
  last_run_result: string | null;
}

const jobs = table<MaintenanceRow>("maintenance", () =>
  maintenanceTasks.map((t) => ({
    id: t.id,
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

const isSuperuser = () => findUser(currentUserId())?.role === "superuser";

export const maintenanceRoutes: Record<string, Handler> = {
  "GET /api/demo/maintenance": (_params, _body, query) => {
    if (!isSuperuser()) return forbidden();
    return json(200, paged("/api/demo/maintenance", jobs.rows(), query));
  },
  "POST /api/demo/maintenance/:id/runs": ({ id }) => {
    if (!isSuperuser()) return forbidden();
    if (!jobs.rows().some((j) => j.id === id)) return notFound();
    jobs.update(
      (j) => j.id === id,
      (j) => ({ ...j, last_run_at: now(), last_run_result: results[id!] ?? "Done" }),
    );
    return json(201, { data: jobs.rows().find((j) => j.id === id) });
  },
};
