import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ChannelDetails } from "../../model/channels";
import { FormError } from "../../model/form-error";
import { renderPage } from "../../test/renderPage";
import ChannelPage, { type ChannelPageData, type ChannelPageProps } from "./ChannelPage";

const channel = (more: Partial<ChannelDetails> = {}): ChannelDetails => ({
  channelType: "read",
  system: { name: "DHIS2", adaptor: "dhis2" },
  method: "GET",
  endpoint: "https://dhis2.example.org/api/trackedEntityInstances",
  auth: "Basic",
  payload: "{}",
  days: [],
  medianMs: 120,
  messages: [],
  ...more,
});

const data = (details: ChannelDetails): ChannelPageData => ({
  projectId: "p",
  projectName: "planning",
  component: { id: "c", name: "Patient lookup", description: "Finds a patient in DHIS2.", type: "Channel" },
  channel: details,
});

const frame: Omit<ChannelPageProps, "data" | `on${string}`> = {
  node: { id: "component", label: "Component" },
  ancestors: [],
  currentPath: "/projects/p/components/c",
};

const all = ["onOpenWorkflow", "onOpenRun", "onEditChannel", "onSetEnabled", "onDeleteChannel"] as const;
const draw = (details = channel(), actions: readonly (typeof all)[number][] = all) => renderPage(ChannelPage, { ...frame, data: data(details) }, [...actions]);

const pick = (item: string) => {
  fireEvent.click(screen.getByRole("button", { name: "Actions for Patient lookup" }));
  fireEvent.click(screen.getByRole("menuitem", { name: item }));
};

describe("ChannelPage", () => {
  it("draws the channel with its kind and description", () => {
    draw();
    expect(screen.getByRole("heading", { name: "Patient lookup" })).toBeTruthy();
    expect(screen.getAllByText("Finds a patient in DHIS2.").length).toBeGreaterThan(0);
    expect(screen.queryByText("This channel is off")).toBeNull();
  });

  it("says a channel that's off refuses requests", () => {
    draw(channel({ enabled: false }));
    expect(screen.getByText("This channel is off")).toBeTruthy();
  });

  it("turns the channel off, and takes a refusal quietly (the wrapper says why)", async () => {
    const host = draw();
    pick("Turn off");
    expect(host.calls("onSetEnabled")).toEqual([[false]]);
    await host.reject("onSetEnabled", new FormError("Someone else changed this channel."));
    // It can be tried again.
    pick("Turn off");
    expect(host.calls("onSetEnabled")).toHaveLength(2);
  });

  it("ignores a second Turn off while the first is still saving", async () => {
    const host = draw();
    pick("Turn off");
    pick("Turn off");
    expect(host.calls("onSetEnabled")).toHaveLength(1);
    await host.resolve("onSetEnabled");
  });

  it("deletes the channel once confirmed, and takes a refusal quietly (the wrapper says why)", async () => {
    const host = draw();
    pick("Delete");
    fireEvent.click(screen.getByRole("button", { name: "Delete channel" }));
    expect(host.calls("onDeleteChannel")).toHaveLength(1);
    await host.reject("onDeleteChannel", new FormError("You can't delete channels in this project."));
    expect(screen.queryByRole("button", { name: "Delete channel" })).toBeNull();
  });

  it("opens the workflow behind its messages", () => {
    const host = draw();
    fireEvent.click(screen.getByRole("button", { name: "Open workflow" }));
    expect(host.calls("onOpenWorkflow")).toHaveLength(1);
  });

  it("offers a reader no menu", () => {
    draw(channel(), []);
    expect(screen.queryByRole("button", { name: "Actions for Patient lookup" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Open workflow" })).toBeNull();
  });
});
