import { useState } from "react";
import FormModal from "../FormModal";
import { TextInput } from "../Inputs";
import type { Credential } from "../../types/credentials";
import { isValidEmail } from "../../utils/validate";

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
  const valid = isValidEmail(email.trim());
  const modalId = `transfer-credential-${credential.id}-modal`;

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={revoke ? "Revoke Credential Transfer" : "Transfer Credential Ownership"}
      description={
        revoke
          ? "A transfer of this credential is pending. Click the revoke button to cancel it."
          : "Enter the email address of the new owner. Note: The user must be a member of all projects where this credential is used."
      }
      size="xl"
      formId={`${modalId}-form`}
      formClassName=""
      onSubmit={() => {
        if (revoke) onRevoke?.();
        else onTransfer?.(email.trim());
        onClose();
      }}
      submitLabel={revoke ? "Revoke" : "Transfer"}
      submitId={revoke ? `${modalId}-revoke-button` : `${modalId}-submit-button`}
      submitDisabled={!revoke && !valid}
    >
      {revoke ? (
        <p className="text-sm text-gray-600">
          Revoking this transfer will cancel the pending request. This will keep the credential under your ownership.
          You will need to initiate a new transfer request to transfer it in the future.
        </p>
      ) : (
        <TextInput
          id="receiver_email"
          placeholder="email@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      )}
    </FormModal>
  );
}
