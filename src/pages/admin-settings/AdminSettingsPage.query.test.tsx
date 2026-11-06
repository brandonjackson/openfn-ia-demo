import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, listAll, request } from "../../api/client";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { iaTree } from "../../model/ia-tree";
import AdminSettingsPageQuery from "./AdminSettingsPage.query";

const wait = { timeout: 3000 };

function renderRoute(url = "/admin-settings/users") {
  const path = url.split("?")[0]!;
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[url]}>
        <AdminSettingsPageQuery route={route} />
      </MemoryRouter>
    </ApiProvider>,
  );
}

type Many = { data: { id: string; attributes: { email: string; first_name: string; last_name: string } }[] };

async function createUser(email: string) {
  fireEvent.click(await screen.findByRole("button", { name: "New user" }, wait));
  fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Lena" } });
  fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "Okafor" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "a long enough password" } });
  fireEvent.click(screen.getByRole("button", { name: "Create user" }));
}

describe("AdminSettingsPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
  });

  it("lists every account the server has", async () => {
    const { data } = await request<Many>("GET", "/api/users?page_size=100");
    renderRoute();
    const first = data[0]!.attributes;
    expect(await screen.findByText(`${first.first_name} ${first.last_name}`, {}, wait)).toBeTruthy();
  });

  it("creates the account on the server, and the list reloads with it", async () => {
    renderRoute();
    await createUser("lena@example.org");
    expect(await screen.findByText("Lena Okafor", {}, wait)).toBeTruthy();
    const { data } = await request<Many>("GET", "/api/users?page_size=100");
    expect(data.some((u) => u.attributes.email === "lena@example.org")).toBe(true);
  });

  it("keeps the form open, naming the email, when the server already has an account with it", async () => {
    const { data } = await request<Many>("GET", "/api/users?page_size=100");
    renderRoute();
    await createUser(data[1]!.attributes.email);
    expect(await screen.findByText("Email has already been taken.", {}, wait)).toBeTruthy();
    expect(screen.getByLabelText("First name")).toBeTruthy();
  });

  it("shows the server's message when the list fails to load", async () => {
    failNext("GET /api/users", { status: 500, code: "internal", detail: "Something went wrong in Lightning." });
    renderRoute();
    expect(await screen.findByText("Something went wrong in Lightning.", {}, wait)).toBeTruthy();
  });

  it("runs a maintenance job on the server and shows what it did", async () => {
    renderRoute("/admin-settings/maintenance");
    fireEvent.click((await screen.findAllByRole("button", { name: "Run" }, wait))[0]!);
    expect(await screen.findByText(/214 adaptors, 2 new versions/, {}, wait)).toBeTruthy();
    const { data } = await request<{ data: { title: string; last_run_result: string }[] }>("GET", "/api/demo/maintenance");
    expect(data.find((j) => j.title === "Refresh adaptor registry")?.last_run_result).toBe("214 adaptors, 2 new versions");
  });

  it("asks the server to test the provider's discovery URL and shows that it works", async () => {
    renderRoute("/admin-settings/authentication");
    fireEvent.click(await screen.findByRole("button", { name: "Test" }, wait));
    expect(await screen.findByText("Discovery URL works", {}, wait)).toBeTruthy();
  });

  it("says why when the server won't run the test", async () => {
    failNext("POST /api/demo/auth_provider/test", { status: 403, code: "forbidden", detail: "You are not allowed to do that." });
    renderRoute("/admin-settings/authentication");
    fireEvent.click(await screen.findByRole("button", { name: "Test" }, wait));
    expect(await screen.findByText("Test failed", {}, wait)).toBeTruthy();
    expect(screen.getByText("You are not allowed to do that.")).toBeTruthy();
  });

  describe("the audit trail", () => {
    type Event = { attributes: { event: string; actor_display: { label: string } } };
    const rows = () => screen.getAllByRole("row").slice(1);

    it("opens on the page and filters the URL holds, asking the server for that page", async () => {
      const all = await listAll<Event>("/api/audit_events");
      renderRoute("/admin-settings/audit-trail?page=2");
      expect(await screen.findByText(`Showing 11–20 of ${all.length} events`, {}, wait)).toBeTruthy();
    });

    it("filters by event on the server", async () => {
      const created = (await listAll<Event>("/api/audit_events?event=created")).length;
      renderRoute("/admin-settings/audit-trail?page=2");
      await screen.findByText(/Showing 11–20/, {}, wait);
      fireEvent.change(screen.getByLabelText("Event"), { target: { value: "Created" } });
      await waitFor(() => expect(rows()).toHaveLength(Math.min(created, 10)), wait);
      expect(rows().every((r) => r.textContent?.includes("Created"))).toBe(true);
    });

    it("searches every event that passes the filters, not just the page showing", async () => {
      const all = await listAll<Event>("/api/audit_events");
      const oldest = all.at(-1)!.attributes.actor_display.label;
      const matching = all.filter((e) => e.attributes.actor_display.label === oldest).length;
      renderRoute("/admin-settings/audit-trail");
      await screen.findByText(/Showing 1–10/, {}, wait);
      fireEvent.change(screen.getByPlaceholderText("Filter by item or actor"), { target: { value: oldest } });
      await waitFor(() => expect(rows().every((r) => r.textContent?.includes(oldest))).toBe(true), wait);
      expect(rows()).toHaveLength(Math.min(matching, 10));
    });

    it("ignores an event name the trail doesn't know", async () => {
      const all = await listAll<Event>("/api/audit_events");
      renderRoute("/admin-settings/audit-trail?event=bogus");
      expect(await screen.findByText(`Showing 1–10 of ${all.length} events`, {}, wait)).toBeTruthy();
    });

    it("shows the server's message when the trail fails to load", async () => {
      failNext("GET /api/audit_events", { status: 500, code: "internal", detail: "The audit trail is unavailable." });
      renderRoute("/admin-settings/audit-trail");
      expect(await screen.findByText("The audit trail is unavailable.", {}, wait)).toBeTruthy();
    });
  });
});
