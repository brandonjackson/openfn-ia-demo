import ConfirmModal from "../ConfirmModal";

/** Lightning's TokenDeletionModal (live/components/token_deletion_modal.ex). */
export default function TokenDeletionModal({ onClose, onDelete }: { onClose: () => void; onDelete?: () => void | Promise<void> }) {
  return (
    <ConfirmModal
      open
      onClose={onClose}
      title="Delete API Access Token"
      tone="danger"
      confirmLabel="Yes"
      onConfirm={async () => {
        await onDelete?.();
        onClose();
      }}
    >
      <p>
        Any applications or scripts using this token will no longer be able to access the API. You cannot undo this
        action.
      </p>
      <p>Are you sure you want to delete this token?</p>
    </ConfirmModal>
  );
}
