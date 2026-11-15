import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderPage } from "../../test/renderPage";
import NotFoundPage from "./NotFoundPage";

describe("NotFoundPage", () => {
  it("says there's no page at the URL", () => {
    renderPage(NotFoundPage, { path: "/nowhere", reason: "page" }, []);
    expect(screen.getByText("Page not found")).toBeTruthy();
    expect(screen.getByText("There's no page at /nowhere.")).toBeTruthy();
  });

  it("says the record a page names isn't there", () => {
    renderPage(NotFoundPage, { path: "/projects/gone/workflows", reason: "data" }, []);
    expect(screen.getByText("Page not found")).toBeTruthy();
    expect(screen.getByText(/What \/projects\/gone\/workflows points to isn't there/)).toBeTruthy();
  });

  it("names the feature that's turned off, and where to turn it on", () => {
    renderPage(NotFoundPage, { path: "/connected-systems", reason: "flag", feature: "Connected systems" }, []);
    expect(screen.getByText("This feature is turned off")).toBeTruthy();
    expect(screen.getByText(/belongs to Connected systems, which is off in this demo/)).toBeTruthy();
  });
});
