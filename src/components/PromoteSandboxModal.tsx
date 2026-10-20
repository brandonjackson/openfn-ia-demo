import { useState } from "react";
import { ArrowRight, FlaskConical, GitMerge } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import FormField from "./FormField";
import { TextArea } from "./FormControls";

interface Props {
  open: boolean;
  onClose: () => void;
  /** The sandbox being promoted. */
  sandbox: string;
  workflowName: string;
  /** The version promoting will create on main, e.g. "v3". */
  nextVersion: string;
  /** Called with the version message when the user confirms. */
  onPromote: (message: string) => void;
}

/**
 * Confirms promoting a sandbox's changes to main. The message becomes the new
 * version's entry in the workflow's version history.
 */
export default function PromoteSandboxModal({ open, ...rest }: Props) {
  // Mounting the form only while open means its state resets on each open.
  if (!open) return null;
  return <PromoteForm {...rest} />;
}

function PromoteForm({ onClose, sandbox, workflowName, nextVersion, onPromote }: Omit<Props, "open">) {
  const [message, setMessage] = useState("");
  const canPromote = message.trim().length > 0;

  return (
    <Modal
      open
      title="Promote to main"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon={GitMerge} disabled={!canPromote} onClick={() => onPromote(message.trim())}>
            Promote to main
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 font-medium text-gray-700">
            <FlaskConical size={14} className="text-gray-500" />
            {sandbox}
          </span>
          <ArrowRight size={14} className="text-gray-400" />
          <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 font-medium text-gray-700">
            <FlaskConical size={14} className="text-gray-500" />
            main
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Your changes to <span className="font-medium text-gray-900">{workflowName}</span> go live on main as{" "}
          <span className="font-medium text-gray-900">{nextVersion}</span>. The current version stays in the
          version history, so you can look back at it any time.
        </p>
        <FormField label="What changed?" htmlFor="promote-message" hint="Shown in the version history.">
          <TextArea
            id="promote-message"
            rows={3}
            autoFocus
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Adds a duplicate-application check before routing"
          />
        </FormField>
      </div>
    </Modal>
  );
}
