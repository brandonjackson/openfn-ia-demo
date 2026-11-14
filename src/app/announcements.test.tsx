import { useEffect } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnnouncementsProvider } from "./announcements";
import { useAnnounce, useAnnounceOutcome } from "./announce";
import { FormError } from "../model/form-error";

let say: ReturnType<typeof useAnnounce>;
let announcing: ReturnType<typeof useAnnounceOutcome>;
function Speaker() {
  const announce = useAnnounce();
  const outcome = useAnnounceOutcome();
  useEffect(() => {
    say = announce;
    announcing = outcome;
  });
  return null;
}

const draw = () =>
  render(
    <AnnouncementsProvider>
      <Speaker />
    </AnnouncementsProvider>,
  );

describe("announcements", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("reads a success out politely, and lets it go by itself", () => {
    draw();
    act(() => say({ tone: "success", message: "Deleted dedup." }));
    expect(screen.getByRole("status").textContent).toContain("Deleted dedup.");
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.queryByText("Deleted dedup.")).toBeNull();
  });

  it("reads an error out at once, and keeps it until it's closed", () => {
    draw();
    act(() => say({ tone: "error", message: "dedup wasn't deleted", detail: "Only its owner can." }));
    expect(screen.getByRole("alert").textContent).toContain("Only its owner can.");
    act(() => vi.advanceTimersByTime(60_000));
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("dedup wasn't deleted")).toBeNull();
  });

  it("waits while the pointer is on a success", () => {
    draw();
    act(() => say({ tone: "success", message: "Saved." }));
    fireEvent.mouseEnter(screen.getByText("Saved.").closest("[data-ui=toast]")!);
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText("Saved.")).toBeTruthy();
  });

  it("stacks toasts, and says the same thing once", () => {
    draw();
    act(() => {
      say({ tone: "success", message: "One." });
      say({ tone: "info", message: "Two." });
      say({ tone: "info", message: "Two." });
    });
    expect(screen.getAllByText("Two.")).toHaveLength(1);
    expect(screen.getByText("One.")).toBeTruthy();
  });

  it("says how an action went, with the server's reason, and hands its refusal back", async () => {
    draw();
    await act(() => announcing(Promise.resolve(), { success: "Made it." }));
    expect(screen.getByText("Made it.")).toBeTruthy();
    const refused = announcing(Promise.reject(new FormError("Refused.", { name: ["is taken"] })), { failure: "It wasn't made" });
    await act(() => expect(refused).rejects.toThrow("Refused."));
    expect(screen.getByRole("alert").textContent).toContain("It wasn't made");
    expect(screen.getByRole("alert").textContent).toContain("Name is taken.");
  });
});
