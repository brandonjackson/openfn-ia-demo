import Modal from "../Modal";
import Button from "../Button";
import ConfirmModal from "../ConfirmModal";
import type { Credential } from "../../types/credentials";

interface Props {
  open: boolean;
  onClose: () => void;
  credential: Credential;
  /** Whether the credential was used in runs still in a project's audit trail. */
  hasActivityInProjects?: boolean;
  onDelete?: () => void;
}

const activityNote =
  "This credential has been used in workflow runs that are still monitored in at least one project's audit trail. The credential will be made unavailable for future use immediately and after a cooling-off period all secrets will be permanently scrubbed, but the record itself will not be removed until related workflow runs have been purged.";

/**
 * Lightning's CredentialDeletionModal (live/components/credential_deletion_modal.ex).
 * A credential already scheduled for deletion gets the "marked for deletion" notice.
 */
export default function CredentialDeletionModal({ open, onClose, credential, hasActivityInProjects = false, onDelete }: Props) {
  if (credential.scheduledDeletion && hasActivityInProjects) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Credential marked for deletion"
        size="sm"
        footer={
          <Button theme="secondary" onClick={onClose}>
            Ok, understood
          </Button>
        }
      >
        <div className="space-y-3 text-sm text-gray-600">
          <p>{activityNote}</p>
          <p>Contact your instance administrator for more details.</p>
        </div>
      </Modal>
    );
  }
  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      title="Delete credential"
      tone="danger"
      confirmLabel="Delete credential"
      onConfirm={() => {
        onDelete?.();
        onClose();
      }}
    >
      <p>
        Deleting this credential will immediately remove it from all jobs and projects. If you later restore it, you
        will need to re-share it with projects and re-associate it with jobs. Are you sure you'd like to delete the
        credential?
      </p>
      {hasActivityInProjects && <p className="italic">*{activityNote}</p>}
    </ConfirmModal>
  );
}
