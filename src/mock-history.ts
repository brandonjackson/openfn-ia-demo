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
