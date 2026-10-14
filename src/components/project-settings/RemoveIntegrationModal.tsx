import ConfirmModal from "../ConfirmModal";

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
}

/** github_sync_component.ex `confirm_connection_removal_modal`. */
export default function RemoveIntegrationModal({ onCancel, onConfirm }: Props) {
  return (
    <ConfirmModal
      open
      onClose={onCancel}
      onConfirm={onConfirm}
      title="Remove Integration?"
      confirmLabel="Disconnect"
      tone="danger"
    >
      <p>
        You are about to disconnect this project from GitHub. Until you reconnect, you will not be able to sync this
        project to GitHub.
      </p>
    </ConfirmModal>
  );
}
