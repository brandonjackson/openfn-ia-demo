import { useSyncExternalStore } from "react";
import type { Dataclip, WorkOrder } from "../model/workflow";

/** A workflow's history as changed this session: its work orders now, and the dataclips its new runs made. */
export interface ChangedHistory {
  workOrders: WorkOrder[];
  dataclips: Dataclip[];
}

/**
 * Work orders changed this session (retried or cancelled from History), by
 * workflow id: the fixtures' stand-in for the server, shared so a run
 * retried in History is there when the editor opens it. Gone on reload.
 */
let changed: Record<string, ChangedHistory> = {};
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Saves a workflow's work orders as they are now, with any dataclips its new runs made. */
export function saveWorkOrders(workflowId: string, workOrders: WorkOrder[], newDataclips: Dataclip[] = []) {
  const dataclips = [...(changed[workflowId]?.dataclips ?? []), ...newDataclips];
  changed = { ...changed, [workflowId]: { workOrders, dataclips } };
  listeners.forEach((l) => l());
}

/** Every workflow's history changed this session, by workflow id. */
export function useChangedHistories(): Record<string, ChangedHistory> {
  return useSyncExternalStore(subscribe, () => changed);
}
