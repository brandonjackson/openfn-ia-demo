import { useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import { TextInput } from "../Inputs";
import type { Credential } from "../../mock-data/credentials";

interface Props {
  open: boolean;
  onClose: () => void;
  credential: Credential;
  /** Called with the receiver's email. */
  onTransfer?: (email: string) => void;
  onRevoke?: () => void;
}

/**
 * Lightning's TransferCredentialModal (credential_live/transfer_credential_modal.ex).
 * A pending transfer shows the revoke variant instead. Lightning checks the
 * receiver is a member of every project using the credential; the demo only
 * checks the email looks like one.
 */
export default function TransferCredentialModal({ open, onClose, credential, onTransfer, onRevoke }: Props) {
  const revoke = credential.transferStatus === "pending";
  const [email, setEmail] = useState("");
  const valid = /^[^@\s]+@[^@\s]+$/.test(email.trim());
  const modalId = `transfer-credential-${credential.id}-modal`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<span className="font-bold">{revoke ? "Revoke Credential Transfer" : "Transfer Credential Ownership"}</span>}
      width="max-w-[50rem]"
      footer={
        revoke ? (
          <>
            <Button id={`${modalId}-revoke-button`} onClick={() => { onRevoke?.(); onClose(); }}>
              Revoke
            </Button>
            <Button theme="secondary" id={`${modalId}-cancel-button`} onClick={onClose}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button id={`${modalId}-submit-button`} disabled={!valid} onClick={() => { onTransfer?.(email.trim()); onClose(); }}>
              Transfer
            </Button>
            <Button theme="secondary" id={`${modalId}-cancel-button`} onClick={onClose}>
              Cancel
            </Button>
          </>
        )
      }
    >
      <div className="text-left">
        <div className="text-sm leading-4.5 text-zinc-600 mb-4">
          {revoke
            ? "A transfer of this credential is pending. Click the revoke button to cancel it."
            : "Enter the email address of the new owner. Note: The user must be a member of all projects where this credential is used."}
        </div>
        {revoke ? (
          <p className="text-sm text-gray-600">
            Revoking this transfer will cancel the pending request. This will keep the credential under your ownership.
            You will need to initiate a new transfer request to transfer it in the future.
          </p>
        ) : (
          <form id={`${modalId}-form`} className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <TextInput
              id="receiver_email"
              placeholder="email@example.com"
              required
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </form>
        )}
      </div>
    </Modal>
  );
}
