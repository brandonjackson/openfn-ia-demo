/**
 * What History lists: the work orders each project's workflows received,
 * with their runs, and the requests each project's channels carried. Built
 * from the same run histories the editor shows, so a run opened from History
 * is the run the editor loads.
 */
import type { ChannelRequest, HistoryWorkOrder } from "../model/history";
import type { HistoryWorkflowOption } from "../model/page-data";
import type { Project } from "../model/projects";
import type { WorkOrder } from "../model/workflow";
import { projects } from "./projects";
import { channelDetails } from "./channels";
import { resolveWorkflow, workflowHistory } from "./workflow-lookup";

/** Work orders changed this session, by workflow id, which stand in for the fixtures' own. */
export type ChangedWorkOrders = Record<string, WorkOrder[]>;

/** A workflow's work orders as they are now: changed this session, or as the fixtures have them. */
export function currentWorkOrders(workflowId: string, changed: ChangedWorkOrders = {}): WorkOrder[] {
  return changed[workflowId] ?? workflowHistory(workflowId).workOrders;
}

/** The newest version any of a workflow's runs ran on. */
export function latestRunVersion(workflowId: string): string {
  const versions = workflowHistory(workflowId).workOrders.flatMap((o) => o.runs.map((r) => r.version));
  return versions.sort().at(-1) ?? "v1";
}

/** `project`'s workflows, with their steps to retry from and their latest version. */
export function historyWorkflows(project: Project): HistoryWorkflowOption[] {
  return project.components
    .filter((c) => c.type === "Workflow")
    .map((c) => {
      const graph = resolveWorkflow(c.id);
      return {
        id: c.id,
        name: c.name,
        projectId: project.id,
        steps: graph.nodes.flatMap((n) => (n.type === "job" ? [{ id: n.id, label: n.label }] : [])),
        latestVersion: latestRunVersion(c.id),
      };
    });
}

/** A run's "dd/mm/yyyy, HH:MM:SS" stamp as something that sorts. */
export function sortableStamp(stamp: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2})$/.exec(stamp);
  return m ? `${m[3]}-${m[2]}-${m[1]} ${m[4]}` : stamp;
}

/** Every work order `project`'s workflows received, newest first. */
export function projectWorkOrders(project: Project, changed: ChangedWorkOrders = {}): HistoryWorkOrder[] {
  return project.components
    .filter((c) => c.type === "Workflow")
    .flatMap((workflow) => {
      const history = workflowHistory(workflow.id);
      return currentWorkOrders(workflow.id, changed).map((workOrder) => {
        const first = workOrder.runs[workOrder.runs.length - 1];
        const input = history.dataclips.find((d) => d.id === first.inputId) ?? {
          id: first.inputId,
          type: "http_request" as const,
          body: "{}",
          created: first.when,
        };
        return {
          workOrder,
          workflowId: workflow.id,
          workflowName: workflow.name,
          projectId: project.id,
          projectName: project.name,
          input,
          receivedAt: first.started,
        };
      });
    })
    .sort((a, b) => sortableStamp(b.receivedAt).localeCompare(sortableStamp(a.receivedAt)));
}

const months: Record<string, string> = { Oct: "10", Nov: "11", Sep: "09" };

/** A channel's "20 Oct, 09:52" as something that sorts. */
function sortableAt(at: string): string {
  const m = /^(\d{1,2}) (\w{3}), (\d{2}:\d{2})$/.exec(at);
  return m ? `${months[m[2]] ?? "00"}-${m[1].padStart(2, "0")} ${m[3]}` : at;
}

/** Every request `project`'s channels carried, newest first. */
export function projectChannelRequests(project: Project): ChannelRequest[] {
  return project.components
    .filter((c) => c.type === "Channel")
    .flatMap((channel) => {
      const details = channelDetails(channel);
      return details.messages.map((m) => ({
        id: m.id,
        channelId: channel.id,
        channelName: channel.name,
        channelType: details.channelType,
        system: details.system.name,
        method: details.method,
        endpoint: details.endpoint,
        status: m.status,
        durationMs: m.durationMs,
        at: m.at,
        summary: m.summary,
        projectId: project.id,
        projectName: project.name,
        runId: m.runId,
        workflowId: m.runId ? details.workflowId : undefined,
      }));
    })
    .sort((a, b) => sortableAt(b.at).localeCompare(sortableAt(a.at)));
}

/** Every work order across every project, newest first, for the organisation's History. */
export function allWorkOrders(changed: ChangedWorkOrders = {}): HistoryWorkOrder[] {
  return projects
    .flatMap((p) => projectWorkOrders(p, changed))
    .sort((a, b) => sortableStamp(b.receivedAt).localeCompare(sortableStamp(a.receivedAt)));
}

/** Every channel request across every project, newest first. */
export function allChannelRequests(): ChannelRequest[] {
  return projects.flatMap(projectChannelRequests).sort((a, b) => sortableAt(b.at).localeCompare(sortableAt(a.at)));
}
