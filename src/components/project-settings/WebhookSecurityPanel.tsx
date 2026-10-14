import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../Button";
import SectionHeader from "../SectionHeader";
import LinkedUsageModal from "./LinkedUsageModal";
import SettingsCard from "./SettingsCard";
import WebhookAuthMethodDeleteModal from "./WebhookAuthMethodDeleteModal";
import WebhookAuthMethodFormModal from "./WebhookAuthMethodFormModal";
import WebhookAuthMethodsTable from "./WebhookAuthMethodsTable";
import type { Project } from "../../mock-data/projects";
import type { WebhookAuthMethod } from "../../mock-data/project-settings";

interface Props {
  projectId: string;
  initialAuthMethods: WebhookAuthMethod[];
  canWrite: boolean;
  /** Set for a sandbox: methods are managed in the parent. */
  parentProject?: Project;
}

type Modal =
  | { kind: "new" }
  | { kind: "edit" | "delete" | "usage"; method: WebhookAuthMethod }
  | null;

/**
 * The Webhook Security tab (`#webhook_security`, settings.html.heex:378-568).
 * Create, edit and delete only change local state.
 */
export default function WebhookSecurityPanel({ projectId, initialAuthMethods, canWrite, parentProject }: Props) {
  const [methods, setMethods] = useState(initialAuthMethods);
  const [modal, setModal] = useState<Modal>(null);
  const close = () => setModal(null);
  const title = "Webhook security";
  const subtitle = "Webhook authentication methods that are used with the starting trigger in workflows.";

  if (parentProject) {
    return (
      <>
        <SectionHeader title={title} subtitle={subtitle} />
        <SettingsCard
          id="webhook-security-sandbox-notice"
          className="space-y-0"
          title="Webhook authentication is managed in the parent project"
          description="Methods are shared with this sandbox and enforced on its webhook triggers, but can only be created, edited, or deleted from the parent."
        >
          <Link
            to={`/projects/${parentProject.id}/settings#webhook_security`}
            className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-900"
          >
            Manage them in the parent project ({parentProject.name})
          </Link>
        </SettingsCard>
      </>
    );
  }

  return (
    <>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        permissionsSection={canWrite ? undefined : "webhook auth methods."}
        action={
          <Button id="add_new_auth_method" size="lg" disabled={!canWrite} onClick={() => setModal({ kind: "new" })}>
            New auth method
          </Button>
        }
      />
      {(modal?.kind === "new" || modal?.kind === "edit") && (
        <WebhookAuthMethodFormModal
          authMethod={modal.kind === "edit" ? modal.method : undefined}
          onCancel={close}
          onSave={(values) => {
            if (modal.kind === "edit") {
              setMethods(methods.map((m) => (m.id === modal.method.id ? { ...m, name: values.name } : m)));
            } else {
              setMethods([...methods, { ...values, id: `wam-${Date.now()}`, projectId, triggers: [], channels: [] }]);
            }
            close();
          }}
        />
      )}
      {modal?.kind === "delete" && (
        <WebhookAuthMethodDeleteModal
          projectId={projectId}
          authMethod={modal.method}
          onCancel={close}
          onDelete={() => {
            setMethods(methods.filter((m) => m.id !== modal.method.id));
            close();
          }}
        />
      )}
      {modal?.kind === "usage" && <LinkedUsageModal projectId={projectId} authMethod={modal.method} onClose={close} />}
      <WebhookAuthMethodsTable
        authMethods={methods}
        canWrite={canWrite}
        onCreate={() => setModal({ kind: "new" })}
        onView={(method) => setModal({ kind: "edit", method })}
        onDelete={(method) => setModal({ kind: "delete", method })}
        onShowUsage={(method) => setModal({ kind: "usage", method })}
      />
    </>
  );
}
