/** A project's published services, on the demo's own routes (Lightning's API has no services yet). */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProjectServiceItem } from "../model/services";
import { listAll, request } from "./client";
import { statusOf, type LoadStatus } from "./status";

interface ApiService {
  id: string;
  attributes: Omit<ProjectServiceItem, "id" | "workflowId"> & { project_id: string; code: string; workflow_id: string | null };
}

/** A service as the pages show it, with its project and its code (the end of its address). */
export interface ServiceRecord extends ProjectServiceItem {
  projectId: string;
  code: string;
}

const toService = ({ id, attributes: { project_id, code, workflow_id, ...a } }: ApiService): ServiceRecord => ({
  ...a,
  id,
  projectId: project_id,
  code,
  ...(workflow_id && { workflowId: workflow_id }),
});

const keys = { all: ["services"] as const };

/** Every service in the organisation: the catalog's. Pass `enabled: false` when the catalog is off, and it loads nothing. */
export function useAllServices(enabled = true): { status: LoadStatus; services: ServiceRecord[] } {
  const query = useQuery({ queryKey: keys.all, enabled, queryFn: () => listAll<ApiService>("/api/demo/services"), select: (rows) => rows.map(toService) });
  return enabled ? { status: statusOf(query), services: query.data ?? [] } : { status: { state: "ready" }, services: [] };
}

/** A project's services. Pass `enabled: false` when the catalog is off, and it loads nothing. */
export function useProjectServices(projectId: string | undefined, enabled = true): { status: LoadStatus; services: ServiceRecord[] } {
  const { status, services } = useAllServices(enabled);
  return { status, services: services.filter((s) => s.projectId === projectId) };
}

/** Turning MCP on and publishing to X-Road. Each resolves once the catalog has reloaded. */
export function useServiceSaves() {
  const queryClient = useQueryClient();
  const patch = useMutation({
    mutationFn: ({ service, body }: { service: ServiceRecord; body: Record<string, unknown> }) =>
      request("PATCH", `/api/demo/projects/${service.projectId}/services/${service.id}`, body),
    onSuccess: () => Promise.all([queryClient.invalidateQueries({ queryKey: keys.all }), queryClient.invalidateQueries({ queryKey: ["audit_events"] })]),
  });
  return {
    enableMcp: async (service: ServiceRecord) => void (await patch.mutateAsync({ service, body: { mcpEnabled: true } })),
    publishToXRoad: async (service: ServiceRecord) =>
      void (await patch.mutateAsync({ service, body: { xroad: { ...service.xroad, serviceCode: service.xroad?.serviceCode ?? service.code, published: true } } })),
  };
}
