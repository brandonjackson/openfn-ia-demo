import { Link } from "react-router-dom";
import Modal from "../Modal";
import { linkClass } from "./classes";
import type { WebhookAuthMethod } from "../../mock-data/project-settings";

interface Props {
  projectId: string;
  authMethod: WebhookAuthMethod;
  onClose: () => void;
}

/** `linked_usage_for_webhook_auth_method_modal` (workflow_live/components.ex). */
export default function LinkedUsageModal({ projectId, authMethod, onClose }: Props) {
  const channels = [...authMethod.channels].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <Modal open onClose={onClose} title="Associated Triggers & Channels">
      <div className="space-y-6">
        <p>
          The "<span className="font-semibold">{authMethod.name}</span>" authentication method is used by:
        </p>
        {authMethod.triggers.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-900">Workflow triggers ({authMethod.triggers.length})</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {authMethod.triggers.map((t) => (
                <li key={t.triggerId}>
                  <Link to={`/projects/${projectId}/w/${t.workflowId}?s=${t.triggerId}`} className={linkClass}>
                    {t.workflowName}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {channels.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-900">Channels ({channels.length})</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {channels.map((c) => (
                <li key={c.id}>
                  <Link to={`/projects/${projectId}/channels/${c.id}/edit`} className={linkClass}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Modal>
  );
}
