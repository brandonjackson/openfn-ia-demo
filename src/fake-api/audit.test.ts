import { beforeEach, describe, expect, it } from "vitest";
import { forgetCsrfToken, listAll, listPage, request } from "../api/client";
import { resetFakeApi, setWait } from ".";
import { projectIdFor } from "./projects";

type Event = { id: string; attributes: { event: string; item_type: string; inserted_at: string } };

beforeEach(() => {
  setWait(0);
  resetFakeApi();
  forgetCsrfToken();
});

describe("GET /api/audit_events", () => {
  it("pages the trail newest first, and a page's total adds up to the whole list", async () => {
    const all = await listAll<Event>("/api/audit_events");
    const times = all.map((e) => e.attributes.inserted_at);
    expect(times).toEqual([...times].sort().reverse());
    const second = await listPage<Event>("/api/audit_events", 2, 10);
    expect(second.total).toBe(all.length);
    expect(second.page).toBe(2);
    expect(second.rows.map((e) => e.id)).toEqual(all.slice(10, 20).map((e) => e.id));
  });

  it("filters by event and item type on the server, before paging", async () => {
    const all = await listAll<Event>("/api/audit_events");
    const created = all.filter((e) => e.attributes.event === "created" && e.attributes.item_type === "project");
    const page = await listPage<Event>("/api/audit_events?event=created&item_type=project", 1, 10);
    expect(page.total).toBe(created.length);
    expect(page.rows.map((e) => e.id)).toEqual(created.slice(0, 10).map((e) => e.id));
  });

  it("answers the last page for one past the end, and says which it is", async () => {
    const all = await listAll<Event>("/api/audit_events");
    const last = Math.ceil(all.length / 10);
    const page = await listPage<Event>("/api/audit_events", last + 5, 10);
    expect(page.page).toBe(last);
    expect(page.rows.map((e) => e.id)).toEqual(all.slice((last - 1) * 10).map((e) => e.id));
  });

  it("records a change as the newest event", async () => {
    await request("PUT", `/api/projects/${projectIdFor("project-a")}`, { name: "planning", description: "Renamed" });
    const { rows } = await listPage<Event>("/api/audit_events", 1, 10);
    expect(rows[0]!.attributes).toMatchObject({ event: "updated", item_type: "project" });
  });
});
