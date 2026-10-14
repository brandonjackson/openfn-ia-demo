import Button from "../Button";
import Modal from "../Modal";

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
}

/** github_sync_component.ex `confirm_connection_removal_modal`. */
export default function RemoveIntegrationModal({ onCancel, onConfirm }: Props) {
  return (
    <Modal
      open
      onClose={onCancel}
      width="max-w-md"
      title="Remove Integration?"
      footer={
        <>
          <Button id="remove_connection_modal_confirm_button" theme="danger" onClick={onConfirm}>
            Disconnect
          </Button>
          <Button theme="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-500">
        You are about to disconnect this project from GitHub. Until you reconnect, you will not be able to sync this
        project to GitHub.
      </p>
    </Modal>
  );
}
