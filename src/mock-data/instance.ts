import type { InstanceSettingsPageData } from "../page-data";

export const instanceSettingsData: InstanceSettingsPageData = {
  pageType: "instance-settings",
  members: [
    { id: "m-1", name: "Jane Doe", email: "jane.doe@example.org", role: "Owner", lastActive: "Today" },
    { id: "m-2", name: "Amadou Diallo", email: "adiallo@example.org", role: "Admin", lastActive: "Yesterday" },
    { id: "m-3", name: "John Smith", email: "jsmith@example.org", role: "Member", lastActive: "3 days ago" },
    { id: "m-4", name: "Beth Wilson", email: "bwilson@example.org", role: "Member", lastActive: "2 weeks ago" },
  ],
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
  contextLayers: [
    {
      id: "dtu-central",
      name: "DTU Central",
      host: "Hosted on OpenFn Cloud",
      url: "https://app.openfn.org/context/dtu-central",
      status: "connected",
      lastFetched: "14 minutes ago",
    },
  ],
};
