
export interface HistoryEntry {
  id: number;
  type: "Work Order" | "Channel Request";
  name: string;
  project: string;
  status: "Success" | "Failed" | "Pending";
  timestamp: string;
}
