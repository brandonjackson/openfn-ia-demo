import Button from "../Button";
import Modal from "../Modal";
import type { User } from "../../mock-data/users";
import { fullName } from "../../mock-data/users";

interface Props {
  user: User;
  /** Names of credentials the user owns that will be removed from the project. */
  ownedCredentials?: string[];
  onCancel: () => void;
  onConfirm: () => void;
}

/** settings.ex `confirm_user_removal_modal`. */
export default function RemoveCollaboratorModal({ user, ownedCredentials = [], onCancel, onConfirm }: Props) {
  const name = fullName(user);
  const credentialsText =
    ownedCredentials.length === 0
      ? ""
      : ownedCredentials.length === 1
        ? ` and their owned credential ${ownedCredentials[0]} will be removed from it`
        : ` and their owned credentials ${ownedCredentials.join(", ")} will be removed from it`;
  return (
    <Modal
      open
      onClose={onCancel}
      width="max-w-md"
      title={`Remove ${name}`}
      footer={
        <>
          <Button theme="danger" onClick={onConfirm}>
            Confirm
          </Button>
          <Button theme="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-500">
        Are you sure you want to remove "{name}" from this project? They will no longer have access to this project
        {credentialsText}.
        <br /> Do you wish to proceed with this action?
      </p>
    </Modal>
  );
}
