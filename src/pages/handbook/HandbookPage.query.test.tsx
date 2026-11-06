import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import ApiProvider from "../../api/ApiProvider";
import { forgetCsrfToken, request } from "../../api/client";
import { findNodeByPath } from "../../app/ia-utils";
import { failNext, resetFakeApi, setWait } from "../../fake-api";
import { iaTree } from "../../model/ia-tree";
import HandbookPageQuery from "./HandbookPage.query";

const wait = { timeout: 3000 };

function renderRoute(path = "/handbook") {
  const route = { ...findNodeByPath(iaTree, path)!, currentPath: path };
  render(
    <ApiProvider retry={false}>
      <MemoryRouter initialEntries={[path]}>
        <HandbookPageQuery route={route} />
      </MemoryRouter>
    </ApiProvider>,
  );
}

type Article = { data: { attributes: { sections: { title: string }[] } } };
type Files = { data: { attributes: { name: string } }[] };

describe("HandbookPageQuery", () => {
  beforeEach(() => {
    setWait(0);
    resetFakeApi();
    forgetCsrfToken();
  });

  it("shows the article and the files the server has", async () => {
    const article = await request<Article>("GET", "/api/demo/handbook");
    const files = await request<Files>("GET", "/api/demo/handbook/files");
    renderRoute();
    expect((await screen.findAllByText(article.data.attributes.sections[0]!.title, {}, wait)).length).toBeGreaterThan(0);
    expect(screen.getByText(files.data[0]!.attributes.name)).toBeTruthy();
  });

  it("saves the edited article on the server, and the page reloads with it", async () => {
    renderRoute();
    fireEvent.click(await screen.findByRole("button", { name: "Edit" }, wait));
    fireEvent.change(screen.getByLabelText("Article"), { target: { value: "## A new heading\n\nA new first line." } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("A new heading", {}, wait)).toBeTruthy();
    const article = await request<Article>("GET", "/api/demo/handbook");
    expect(article.data.attributes.sections.map((s) => s.title)).toEqual(["A new heading"]);
  });

  it("keeps the editor open with the server's reason when it refuses a heading used twice", async () => {
    renderRoute();
    fireEvent.click(await screen.findByRole("button", { name: "Edit" }, wait));
    fireEvent.change(screen.getByLabelText("Article"), { target: { value: "## Same\n\nOne.\n\n## Same\n\nTwo." } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("That didn't save", {}, wait)).toBeTruthy();
    expect(screen.getByLabelText("Article")).toBeTruthy();
  });

  it("shows the server's message when the handbook fails to load", async () => {
    failNext("GET /api/demo/handbook", { status: 500, code: "internal", detail: "The handbook is unavailable." });
    renderRoute();
    expect(await screen.findByText("The handbook is unavailable.", {}, wait)).toBeTruthy();
  });
});
