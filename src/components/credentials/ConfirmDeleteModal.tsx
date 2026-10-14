import type { ReactNode } from "react";
import Modal from "../Modal";
import Button from "../Button";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  id?: string;
}

/**
 * The credential index's small confirm modals (credential_index_component.ex
 * `delete_oauth_client_modal`, `delete_keychain_credential_modal`): a gray
 * warning paragraph, a danger button and Cancel.
 */
export default function ConfirmDeleteModal({ open, onClose, onConfirm, title, children, confirmLabel = "Delete", id }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<span className="font-bold">{title}</span>}
      footer={
        <>
          <Button id={id && `${id}_confirm_button`} theme="danger" onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </Button>
          <Button theme="secondary" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      <div>
        <p className="text-sm text-gray-500">
          {children}
          <br />
          <br />
          Do you want to proceed with this action?
        </p>
      </div>
    </Modal>
  );
}
