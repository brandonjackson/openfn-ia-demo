import Alert from "../Alert";
import ConfirmModal from "../ConfirmModal";
import { UsageLinks } from "./LinkedUsageModal";
import type { WebhookAuthMethod } from "../../types/project-settings";

interface Props {
  projectId: string;
  authMethod: WebhookAuthMethod;
  onCancel: () => void;
  onDelete: () => void;
}

const countLabel = (n: number, noun: string) => (n === 1 ? `1 ${noun}` : `${n} ${noun}s`);

/**
 * WebhookAuthMethodDeleteModal (workflow_live/webhook_auth_method_delete_modal.ex):
 * lists what loses protection and asks for "DELETE".
 */
export default function WebhookAuthMethodDeleteModal({ projectId, authMethod, onCancel, onDelete }: Props) {
  const { triggers, channels } = authMethod;
  const unused = triggers.length === 0 && channels.length === 0;

  return (
    <ConfirmModal
      open
      onClose={onCancel}
      onConfirm={onDelete}
      title="Delete Authentication Method"
      confirmLabel="Delete authentication method"
      tone="danger"
      confirmation={{
        id: "delete_confirmation_confirmation",
        label: "Type in 'DELETE' to confirm the deletion",
        expected: "DELETE",
      }}
    >
      <p>
        You are about to delete the webhook auth method "<span className="font-bold">{authMethod.name}</span>"
        {unused
          ? " which is used by no workflows or channels."
          : ". This cannot be undone, and it will be removed from everything listed below."}
      </p>
      {triggers.length > 0 && (
        <Alert type="warning" header={`${countLabel(triggers.length, "workflow trigger")} will stop requiring authentication`}>
          <UsageLinks projectId={projectId} authMethod={authMethod} kind="triggers" />
        </Alert>
      )}
      {channels.length > 0 && (
        <Alert type="danger" header={`${countLabel(channels.length, "channel")} will accept unauthenticated requests`}>
          <UsageLinks projectId={projectId} authMethod={authMethod} kind="channels" />
          <p className="mt-2">
            These channels stay enabled and keep forwarding requests to their destination with the project
            credential attached. Add another client auth method, or disable the channels, before deleting this one.
          </p>
        </Alert>
      )}
    </ConfirmModal>
  );
}
