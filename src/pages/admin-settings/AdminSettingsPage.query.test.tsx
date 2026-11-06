import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { iaTree } from "../../model/ia-tree";
import AdminSettingsPageQuery from "./AdminSettingsPage.query";

const wait = { timeout: 3000 };

function renderRoute() {
  const route = { ...findNodeByPath(iaTree, "/admin-settings/users")!, currentPath: "/admin-settings/users" };
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={["/admin-settings/users"]}>
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
});
