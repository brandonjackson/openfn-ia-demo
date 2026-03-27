import type { TablePageData } from "../page-data";

export interface HistoryEntry {
  id: number;
  type: "Work Order" | "Channel Request";
  name: string;
  project: string;
  status: "Success" | "Failed" | "Pending";
  timestamp: string;
}

export const mockEntries: HistoryEntry[] = [
  { id: 1, type: "Work Order", name: "Sync patient records", project: "Project A", status: "Success", timestamp: "2026-03-27 09:12" },
  { id: 2, type: "Channel Request", name: "POST /api/patients (DHIS2)", project: "Project A", status: "Success", timestamp: "2026-03-27 09:10" },
  { id: 3, type: "Work Order", name: "Import survey responses", project: "Project B", status: "Success", timestamp: "2026-03-27 08:45" },
  { id: 4, type: "Channel Request", name: "GET /api/surveys (KoBoToolbox)", project: "Project B", status: "Failed", timestamp: "2026-03-27 08:40" },
  { id: 5, type: "Work Order", name: "Push facility data", project: "Project A", status: "Failed", timestamp: "2026-03-27 08:30" },
  { id: 6, type: "Channel Request", name: "POST /webhook/facilities (OpenMRS)", project: "Project A", status: "Pending", timestamp: "2026-03-27 08:28" },
  { id: 7, type: "Work Order", name: "Transform case data", project: "Project A", status: "Success", timestamp: "2026-03-27 07:55" },
  { id: 8, type: "Work Order", name: "Export analytics report", project: "Project B", status: "Pending", timestamp: "2026-03-27 07:20" },
  { id: 9, type: "Channel Request", name: "POST /api/events (CommCare)", project: "Project B", status: "Success", timestamp: "2026-03-27 07:15" },
  { id: 10, type: "Work Order", name: "Sync inventory levels", project: "Project A", status: "Success", timestamp: "2026-03-26 23:00" },
  { id: 11, type: "Channel Request", name: "PUT /api/stock (OpenLMIS)", project: "Project A", status: "Success", timestamp: "2026-03-26 22:58" },
  { id: 12, type: "Work Order", name: "Update contact records", project: "Project B", status: "Failed", timestamp: "2026-03-26 22:15" },
];

export const historyData: TablePageData = {
  pageType: "table",
  filters: [
    { label: "Project", options: ["All Projects", "Project A", "Project B"] },
    { label: "Type", options: ["All", "Work Order", "Channel Request"] },
    { label: "Status", options: ["All", "Success", "Failed", "Pending"] },
  ],
  columns: [
    { key: "id", label: "#" },
    { key: "name", label: "Name" },
    {
      key: "type",
      label: "Type",
      colorMap: {
        "Work Order": "bg-blue-50 text-blue-700",
        "Channel Request": "bg-purple-50 text-purple-700",
      },
    },
    { key: "project", label: "Project" },
    {
      key: "status",
      label: "Status",
      colorMap: {
        Success: "bg-green-100 text-green-700",
        Failed: "bg-red-100 text-red-700",
        Pending: "bg-yellow-100 text-yellow-700",
      },
    },
    { key: "timestamp", label: "Timestamp" },
  ],
  rows: mockEntries as unknown as Record<string, unknown>[],
};
