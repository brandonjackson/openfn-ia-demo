import ConfirmModal from "../ConfirmModal";
import type { User } from "../../types/users";
import { fullName } from "../../utils/format";

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
    <ConfirmModal open onClose={onCancel} onConfirm={onConfirm} title={`Remove ${name}`} confirmLabel="Confirm" tone="danger">
      <p>
        Are you sure you want to remove "{name}" from this project? They will no longer have access to this project
        {credentialsText}.
      </p>
      <p>Do you wish to proceed with this action?</p>
    </ConfirmModal>
  );
}
