import { useState } from "react";
import Button from "../Button";
import { TextInput } from "../Inputs";
import Modal from "../Modal";

interface Props {
  open?: boolean;
  onClose: () => void;
  /** Called with the typed email when "Delete account" is pressed. */
  onDelete?: (email: string) => void;
  /** "Your account…" (profile page) instead of "This user's account…" (admin). */
  isCurrentUser?: boolean;
  /** The user still has auditable activity in projects: shows the extra note. */
  hasActivityInProjects?: boolean;
  /** Deleting now (rather than scheduling) a user with activity: deletion is blocked. */
  blocked?: boolean;
}

/**
 * Lightning's UserDeletionModal (live/components/user_deletion_modal.ex):
 * confirm by typing the user's email, then "Delete account". When the user
 * can't be deleted yet (`blocked`), it only explains why.
 */
export default function UserDeletionModal({
  open = true,
  onClose,
  onDelete,
  isCurrentUser = false,
  hasActivityInProjects = false,
  blocked = false,
}: Props) {
  const [email, setEmail] = useState("");
  const title = <span className="font-bold">Delete user</span>;

  if (blocked) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={title}
        width="max-w-md"
        footer={
          <Button theme="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>
        }
      >
        <p className="text-sm text-gray-500">
          {isCurrentUser ? "Your account" : "This user"} cannot be deleted until their auditable activities have also
          been purged.
          <br />
          <br />
          Audit trails are removed on a project-basis and may be controlled by the project owner or a superuser.
        </p>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-md">
      <form
        id="scheduled_deletion_form"
        onSubmit={(e) => {
          e.preventDefault();
          onDelete?.(email);
        }}
      >
        <p>
          {isCurrentUser ? "Your" : "This user's"} account and credential data will be deleted. Please make sure none
          of these credentials are used in production workflows.
        </p>
        {hasActivityInProjects && (
          <p className="mt-2">
            *Note that {isCurrentUser ? "you still have" : "this user still has"} activity related to active projects.
            We may not be able to delete them entirely from the app until those projects are deleted.
          </p>
        )}
        <br />
        <TextInput
          id="scheduled_deletion_email"
          label="User email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex-grow bg-gray-100 h-0.5 my-[16px]" />
        <div className="flex flex-row-reverse gap-4">
          <Button type="submit" theme="danger">
            Delete account
          </Button>
          <Button theme="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
