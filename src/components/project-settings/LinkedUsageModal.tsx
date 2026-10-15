import Heading from "../Heading";
import Modal from "../Modal";
import TextLink from "../TextLink";
import type { WebhookAuthMethod } from "../../types/project-settings";

interface Props {
  projectId: string;
  authMethod: WebhookAuthMethod;
  onClose: () => void;
}

/**
 * The workflow triggers or channels an auth method protects, as a bulleted
 * list of links. Shared with WebhookAuthMethodDeleteModal.
 */
export function UsageLinks({ projectId, authMethod, kind }: { projectId: string; authMethod: WebhookAuthMethod; kind: "triggers" | "channels" }) {
  const links =
    kind === "triggers"
      ? authMethod.triggers.map((t) => ({
          key: t.triggerId,
          to: `/projects/${projectId}/w/${t.workflowId}?s=${t.triggerId}`,
          label: t.workflowName,
        }))
      : [...authMethod.channels]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((c) => ({ key: c.id, to: `/projects/${projectId}/channels/${c.id}/edit`, label: c.name }));
  return (
    <ul className="list-disc space-y-1 pl-5">
      {links.map((l) => (
        <li key={l.key}>
          <TextLink to={l.to}>{l.label}</TextLink>
        </li>
      ))}
    </ul>
  );
}

/** `linked_usage_for_webhook_auth_method_modal` (workflow_live/components.ex). */
export default function LinkedUsageModal({ projectId, authMethod, onClose }: Props) {
  const { triggers, channels } = authMethod;
  return (
    <Modal open onClose={onClose} title="Associated Triggers & Channels">
      <div className="space-y-6">
        <p>
          The "<span className="font-semibold">{authMethod.name}</span>" authentication method is used by:
        </p>
        {triggers.length > 0 && (
          <section className="space-y-2">
            <Heading size="sm">Workflow triggers ({triggers.length})</Heading>
            <UsageLinks projectId={projectId} authMethod={authMethod} kind="triggers" />
          </section>
        )}
        {channels.length > 0 && (
          <section className="space-y-2">
            <Heading size="sm">Channels ({channels.length})</Heading>
            <UsageLinks projectId={projectId} authMethod={authMethod} kind="channels" />
          </section>
        )}
      </div>
    </Modal>
  );
}
