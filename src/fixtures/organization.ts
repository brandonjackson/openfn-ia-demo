import type { OrganizationSettings } from "../model/organization";
import { connectionOf } from "../model/connected-systems";
import { connectedSystems } from "./connected-systems";
import { orgXRoad } from "./xroad";
import { projects } from "./projects";

/** The organisation's settings, which the fake server is seeded from. */
export const organizationSettingsData: OrganizationSettings = {
  name: orgXRoad.memberName,
  members: [
    { id: "m-1", name: "Jane Doe", email: "jane.doe@example.org", role: "Admin", joined: "6 months ago" },
    { id: "m-2", name: "Amadou Diallo", email: "adiallo@example.org", role: "Admin", joined: "6 months ago" },
    { id: "m-3", name: "John Smith", email: "jsmith@example.org", role: "Member", joined: "3 months ago" },
    { id: "m-4", name: "Beth Wilson", email: "bwilson@example.org", role: "Member", joined: "2 weeks ago" },
  ],
  visibility: { projects: "project", systems: "organization", services: "server" },
  xroad: orgXRoad,
  xroadUsage: {
    systems: connectedSystems.filter((s) => connectionOf(s).method === "xroad").length,
    services: projects.flatMap((p) => p.services).filter((s) => s.xroad?.published).length,
  },
  billing: {
    plan: "Core",
    price: "$1,200 / month",
    renewsOn: "1 Nov 2026",
    runsUsed: 41250,
    runsIncluded: 60000,
    invoices: [
      { id: "inv-2026-10", date: "1 Oct 2026", amount: "$1,200.00", status: "Paid" },
      { id: "inv-2026-09", date: "1 Sep 2026", amount: "$1,200.00", status: "Paid" },
      { id: "inv-2026-08", date: "1 Aug 2026", amount: "$1,200.00", status: "Paid" },
    ],
  },
};

/**
 * A logo the organisation might upload: a health ministry's shield, as the
 * data URL the fake server keeps. Not seeded, so the corner shows the
 * organisation's initials until someone uploads one; stories use it.
 */
export const organizationLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiMwZjc2NmUiLz48cGF0aCBkPSJNMzIgMTJsMTYgNnYxMmMwIDExLTcgMTktMTYgMjItOS0zLTE2LTExLTE2LTIyVjE4eiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0yOSAyNGg2djZoNnY2aC02djZoLTZ2LTZoLTZ2LTZoNnoiIGZpbGw9IiMwZjc2NmUiLz48L3N2Zz4=";
