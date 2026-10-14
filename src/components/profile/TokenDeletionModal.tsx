import Modal from "../Modal";
import Button from "../Button";

/** Lightning's TokenDeletionModal (live/components/token_deletion_modal.ex). */
export default function TokenDeletionModal({ id, onClose, onDelete }: { id: string; onClose: () => void; onDelete?: () => void }) {
  return (
    <Modal
      open
      onClose={onClose}
      width="max-w-md"
      title={<span className="font-bold">Delete API Access Token</span>}
      footer={
        <>
          <Button
            id={`delete-token-${id}_confirm_button`}
            theme="danger"
            onClick={() => {
              onDelete?.();
              onClose();
            }}
          >
            Yes
          </Button>
          <Button theme="secondary" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-500">
        Any applications or scripts using this token will no longer be able to access the API. You cannot undo this
        action. <br />
        Are you sure you want to delete this token?
      </p>
    </Modal>
  );
}
