/**
 * Webhook auth methods on Lightning's API (api/webhooks.md), and which
 * triggers each one guards, which is set on the workflows' triggers.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { WebhookAuthMethod, WebhookAuthMethodDraft, WebhookTriggerOption } from "../model/webhooks";
import type { WorkflowDocument } from "../model/workflow-document";
import { listAll, request } from "./client";
import { statusOf, type LoadStatus } from "./status";
import { workflowKeys } from "./workflows";

interface ApiWebhookAuth {
  id: string;
  attributes: {
    name: string;
    auth_type: "basic" | "api";
    username: string | null;
    api_key_last_characters?: string;
    api_key?: string;
    triggers: { id: string; workflow_id: string }[];
  };
}

const toMethod = ({ id, attributes: a }: ApiWebhookAuth): WebhookAuthMethod => ({
  id,
  name: a.name,
  type: a.auth_type,
  ...(a.username && { username: a.username }),
  // Lightning sends a key's last five characters; a password, nothing.
  maskedSecret: a.auth_type === "api" ? `${"•".repeat(15)}${a.api_key_last_characters ?? ""}` : "•".repeat(12),
  triggerIds: a.triggers.map((t) => t.id),
});

export const webhookAuthKeys = { inProject: (projectId: string) => ["webhook_auth_methods", projectId] as const };

/** A project's webhook auth methods. */
export function useWebhookAuthMethods(projectId: string): { status: LoadStatus; methods: WebhookAuthMethod[] } {
  const query = useQuery({
    queryKey: webhookAuthKeys.inProject(projectId),
    queryFn: () => listAll<ApiWebhookAuth>(`/api/projects/${projectId}/webhook_auth_methods`),
    select: (rows) => rows.map(toMethod),
  });
  return { status: statusOf(query), methods: query.data ?? [] };
}

/** A project's webhook triggers, for choosing which a method guards: one per workflow that starts from a webhook. */
export const webhookTriggerOptions = (workflows: WorkflowDocument[]): WebhookTriggerOption[] =>
  workflows.flatMap((w) => w.triggers.filter((t) => t.type === "webhook").map((t) => ({ id: t.id, workflowName: w.name })));

/**
 * Making, renaming and deleting methods, and choosing the triggers each
 * guards. Each resolves once the methods and workflows have reloaded.
 */
export function useWebhookAuthSaves(projectId: string, workflows: WorkflowDocument[]) {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: webhookAuthKeys.inProject(projectId) }),
      queryClient.invalidateQueries({ queryKey: workflowKeys.all }),
    ]);
  const run = useMutation({ mutationFn: (work: () => Promise<unknown>) => work(), onSuccess: refresh });
  const go = <T,>(work: () => Promise<T>) => run.mutateAsync(work) as Promise<T>;

  /** Puts the method on exactly these triggers, and off every other, workflow by workflow. */
  const guard = async (methodId: string, triggerIds: string[]) => {
    for (const w of workflows) {
      const next = w.triggers.map((t) => {
        const ids = (t.webhook_auth_method_ids ?? []).filter((x) => x !== methodId);
        return { ...t, webhook_auth_method_ids: triggerIds.includes(t.id) ? [...ids, methodId] : ids };
      });
      if (JSON.stringify(next) !== JSON.stringify(w.triggers)) {
        await request("PATCH", `/api/projects/${w.project_id}/workflows/${w.id}`, { triggers: next });
      }
    }
  };

  return {
    /** Makes a method and guards the chosen triggers with it. Answers with an API key's whole key, the only time it's sent. */
    create: (draft: WebhookAuthMethodDraft) =>
      go(async () => {
        const id = crypto.randomUUID();
        const { data } = await request<{ data: ApiWebhookAuth }>("PUT", `/api/projects/${projectId}/webhook_auth_methods/${id}`, {
          name: draft.name,
          auth_type: draft.type,
          ...(draft.type === "basic" && { username: draft.username, password: draft.password }),
        });
        await guard(id, draft.triggerIds);
        return { secret: data.attributes.api_key };
      }),
    update: (id: string, changes: { name: string; triggerIds: string[] }) =>
      go(async () => {
        await request("PUT", `/api/projects/${projectId}/webhook_auth_methods/${id}`, { name: changes.name });
        await guard(id, changes.triggerIds);
      }).then(() => undefined),
    remove: (id: string) => go(() => request("DELETE", `/api/projects/${projectId}/webhook_auth_methods/${id}`)).then(() => undefined),
  };
}
