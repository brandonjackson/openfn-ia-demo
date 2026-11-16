import { useState } from "react";
import { historyColumns, type HistoryColumnId } from "../model/history";

/**
 * The optional columns you've added to History, kept by the browser so they
 * stay put across visits and between a project's History and every
 * project's. The API keeps no such preference; it's yours alone, on this
 * browser. Starts with none, so History opens on its name and status.
 */
const STORAGE_KEY = "openfn-demo:history-columns";

function load(): HistoryColumnId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const ids = JSON.parse(raw) as unknown;
      if (Array.isArray(ids)) return historyColumns.filter((c) => ids.includes(c.id)).map((c) => c.id);
    }
  } catch {
    // Unreadable or blocked: start afresh.
  }
  return [];
}

/** History's added columns, with a setter that remembers them. */
export function useHistoryColumns(): [HistoryColumnId[], (columns: HistoryColumnId[]) => void] {
  const [columns, setColumns] = useState(load);
  const change = (next: HistoryColumnId[]) => {
    setColumns(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // They still hold while the page is open.
    }
  };
  return [columns, change];
}
