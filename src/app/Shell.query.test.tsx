import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../api/ApiProvider";
import { forgetCsrfToken, request } from "../api/client";
import { useShell } from "../components/domain/shell-context";
import { failNext, resetFakeApi, setWait, signInAs } from "../fake-api";
import PageRoute from "./PageRoute";
import { setFlags } from "./feature-flags";
import { allFlagsOn } from "../model/feature-flags";
import ShellQuery from "./Shell.query";
import { setSandbox } from "./sandbox-state";
import { projectIdFor } from "../fake-api/projects";

const wait = { timeout: 3000 };

/** What the chrome is given, written out. */
function Chrome() {
  const { instance, organization, user, isSuperuser } = useShell();
  return (
    <ul>
      <li>instance: {instance.name ? `${instance.name} (${instance.initials})` : "blank"}</li>
      <li>organization: {organization ? `${organization.name || "blank"} (${organization.initials})${organization.logo ? " with a logo" : ""}` : "none"}</li>
      <li>user: {user ? `${user.firstName} ${user.lastName}` : "none"}</li>
      <li>superuser: {isSuperuser === undefined ? "unknown" : String(isSuperuser)}</li>
    </ul>
  );
}

function draw(path = "/projects", page = <Chrome />) {
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[path]}>
        <ShellQuery>
          <Routes>
            <Route path="*" element={page} />
          </Routes>
        </ShellQuery>
      </MemoryRouter>
    </ApiProvider>,
  );
}

/** The project bar's part of the chrome, written out, with a way to switch project as its picker does. */
function ProjectChrome({ switchTo }: { switchTo?: string }) {
  const { project, sandbox, sandboxChanges = [], sandboxTarget, onSwitchProject } = useShell();
  return (
    <div>
      <p>project: {project?.name ?? "none"}</p>
      <p>sandbox: {sandbox}</p>
      <p>sandboxes: {project?.sandboxes.join(", ")}</p>
      <p>target: {sandboxTarget ?? "none"}</p>
      <ul aria-label="Changes">
        {sandboxChanges.map((c) => (
          <li key={c.summary}>{c.summary}</li>
        ))}
      </ul>
      {switchTo && <button onClick={() => onSwitchProject?.(switchTo, `/projects/${switchTo}`)}>Switch project</button>}
    </div>
  );
}

describe("ShellQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
  });

  it("gives the chrome the instance and you from the API, blank or left out until they've loaded", async () => {
    draw();
    expect(screen.getByText("instance: blank")).toBeTruthy();
    expect(screen.getByText("user: none")).toBeTruthy();
    expect(screen.getByText("superuser: unknown")).toBeTruthy();
    expect(await screen.findByText("instance: Sim DTU (SD)", {}, wait)).toBeTruthy();
    expect(await screen.findByText("user: Jane Doe", {}, wait)).toBeTruthy();
    expect(screen.getByText("superuser: true")).toBeTruthy();
  });

  it("gives the corner the organisation's name, its initials, and its logo once it has one", async () => {
    draw();
    expect(await screen.findByText("organization: Ministry of Health (MH)", {}, wait)).toBeTruthy();
    await request("PUT", "/api/demo/organization/logo", { logo: `data:image/png;base64,${btoa("png")}` });
    // A fresh shell reads it again.
    draw();
    expect(await screen.findByText("organization: Ministry of Health (MH) with a logo", {}, wait)).toBeTruthy();
  });

  it("leaves the corner to the instance without Organizations", async () => {
    setFlags({ ...allFlagsOn, organizations: false });
    try {
      draw();
      expect(await screen.findByText("instance: Sim DTU (SD)", {}, wait)).toBeTruthy();
      expect(screen.getByText("organization: none")).toBeTruthy();
    } finally {
      setFlags(allFlagsOn);
    }
  });

  it("says you're not a superuser when the API says so", async () => {
    signInAs("user-john");
    draw();
    expect(await screen.findByText("superuser: false", {}, wait)).toBeTruthy();
  });

  it("names an instance that couldn't be loaded by the page's own host", async () => {
    failNext("GET /api/instance", { status: 500, code: "internal", detail: "Something broke." });
    draw();
    expect(await screen.findByText(`instance: ${window.location.hostname} (${window.location.hostname.slice(0, 2).toUpperCase()})`, {}, wait)).toBeTruthy();
  });

  it("says why at Admin settings when you can't be loaded, not Not Found", async () => {
    failNext("GET /api/me", { status: 500, code: "internal", detail: "Something broke." });
    draw("/admin-settings", <PageRoute />);
    expect(await screen.findByText("Something broke.", {}, wait)).toBeTruthy();
    expect(screen.queryByText("Page Not Found")).toBeNull();
  });

  it("opens Admin settings for a superuser once the API has said so, not Not Found first", async () => {
    draw("/admin-settings", <PageRoute />);
    expect(screen.queryByText("Page Not Found")).toBeNull();
    expect(await screen.findByRole("link", { name: "Users" }, wait)).toBeTruthy();
  });

  it("says Not Found at Admin settings to someone who isn't a superuser", async () => {
    signInAs("user-john");
    draw("/admin-settings", <PageRoute />);
    expect(await screen.findByText("Page Not Found", {}, wait)).toBeTruthy();
  });

  describe("in a project", () => {
    const projectA = projectIdFor("project-a");
    const projectB = projectIdFor("project-b");
    beforeEach(() => {
      act(() => {
        setSandbox(projectA, "main");
        setSandbox(projectB, "main");
      });
    });

    it("gives the sandbox chip what the selected sandbox would bring back to main", async () => {
      act(() => setSandbox(projectA, "decision-sync-fix"));
      draw(`/projects/${projectA}`, <ProjectChrome />);
      expect(await screen.findByText("sandbox: decision-sync-fix", {}, wait)).toBeTruthy();
      expect((await screen.findAllByText(/^Changed the workflow /, {}, wait)).length).toBeGreaterThan(0);
      expect(screen.getByText("target: main")).toBeTruthy();
    });

    it("opens another project on main, whichever sandbox you were last in there", async () => {
      const sandboxId = crypto.randomUUID();
      await request("PUT", `/api/projects/${projectB}/sandboxes/${sandboxId}`, { name: "left-open" });
      act(() => setSandbox(projectB, "left-open"));
      draw(`/projects/${projectA}`, <ProjectChrome switchTo={projectB} />);
      fireEvent.click(await screen.findByRole("button", { name: "Switch project" }, wait));
      expect(await screen.findByText("project: project-b", {}, wait)).toBeTruthy();
      expect(await screen.findByText(/sandboxes: .*left-open/, {}, wait)).toBeTruthy();
      expect(screen.getByText("sandbox: main")).toBeTruthy();
    });

    it("lists a sandbox name once, even when a sandbox of a sandbox shares it", async () => {
      // Names are unique only among a parent's own sandboxes, as on Lightning.
      const outer = crypto.randomUUID();
      await request("PUT", `/api/projects/${projectA}/sandboxes/${outer}`, { name: "outer" });
      await request("PUT", `/api/projects/${outer}/sandboxes/${crypto.randomUUID()}`, { name: "decision-sync-fix" });
      draw(`/projects/${projectA}`, <ProjectChrome />);
      const listed = await screen.findByText(/sandboxes: .*outer/, {}, wait);
      expect(listed.textContent!.split(": ")[1].split(", ").filter((n) => n === "decision-sync-fix")).toHaveLength(1);
    });
  });
});
