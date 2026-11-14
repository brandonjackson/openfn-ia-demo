import { useRef, useState } from "react";
import { ArrowRight, FlaskConical, GitMerge, Lock } from "lucide-react";
import { changesLabel, type WorkflowChange } from "../../model/workflow-changes";
import { firstProblemOf } from "../../model/form-error";
import Modal from "../primitives/Modal";
import Button from "../primitives/Button";
import FormField from "../primitives/FormField";
import Stack from "../primitives/Stack";
import Inline from "../primitives/Inline";
import Text from "../primitives/Text";
import { TextArea } from "../primitives/FormControls";
import EntityPill from "./EntityPill";
import SandboxChangeList from "./SandboxChangeList";

interface Props {
  open: boolean;
  onClose: () => void;
  /** The sandbox being promoted. */
  sandbox: string;
  /** Where its changes go: its parent, usually main. */
  target?: string;
  /** What it changes, listed as the sandbox chip lists them. */
  changes: WorkflowChange[];
  /** The version each changed workflow becomes on the target, e.g. "v3", when there's one to name. */
  nextVersion?: string;
  /**
   * Promotes the changes with what was said about them. Resolves once
   * they're in; a refusal is shown under the message, and the request stays
   * open to try again.
   */
  onPromote: (message: string) => Promise<void>;
}

/**
 * "Create promotion request": takes a sandbox's changes into its parent.
 * It lists what goes, and asks what changed, which becomes each new
 * version's entry in its workflow's history. The editor opens it from the
 * sandbox chip and the Fn menu, the Sandboxes page from a sandbox's menu.
 */
export default function PromoteSandboxModal({ open, ...rest }: Props) {
  // Mounting the form only while open means its state resets on each open.
  if (!open) return null;
  return <PromoteForm {...rest} />;
}

function PromoteForm({ onClose, sandbox, target = "main", changes, nextVersion, onPromote }: Omit<Props, "open">) {
  const [message, setMessage] = useState("");
  const [problem, setProblem] = useState<string>();
  const [promoting, setPromoting] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);

  // The button stays enabled: pressed with nothing said, it says what's missing under the field.
  const submit = async () => {
    if (promoting) return;
    if (!message.trim()) {
      setProblem("Say what changed");
      field.current?.focus();
      return;
    }
    setPromoting(true);
    try {
      await onPromote(message.trim());
      onClose();
    } catch (refused) {
      setProblem(firstProblemOf(refused));
      setPromoting(false);
      field.current?.focus();
    }
  };

  return (
    <Modal
      open
      title="Create promotion request"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon={GitMerge} onClick={submit} aria-disabled={promoting}>
            {promoting ? "Promoting…" : `Promote to ${target}`}
          </Button>
        </>
      }
    >
      <Stack gap="lg">
        <Inline gap="sm">
          <EntityPill name={sandbox} icon={<IconOf name={sandbox} />} shape="tag" size="sm" />
          <ArrowRight size={14} aria-label="into" />
          <EntityPill name={target} icon={<IconOf name={target} />} shape="tag" size="sm" />
        </Inline>
        <Stack gap="sm">
          <Text tone="muted" size="xs">
            {changesLabel(changes.length)} from {target}
          </Text>
          {changes.length > 0 ? (
            <SandboxChangeList changes={changes} />
          ) : (
            <Text tone="muted">Nothing to promote yet: {sandbox} is the same as {target}.</Text>
          )}
        </Stack>
        <Text tone="muted">
          {nextVersion
            ? `Each changed workflow goes live on ${target} as a new version (${nextVersion} here).`
            : `Each changed workflow goes live on ${target} as a new version.`}{" "}
          The versions before stay in the history, so you can look back at them any time.
        </Text>
        <FormField label="What changed?" htmlFor="promote-message" hint="Shown in the version history." error={problem}>
          <TextArea
            id="promote-message"
            ref={field}
            rows={3}
            autoFocus
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setProblem(undefined);
            }}
            placeholder="e.g. Adds a duplicate-application check before routing"
          />
        </FormField>
      </Stack>
    </Modal>
  );
}

/** Main's lock or a sandbox's beaker, beside its name. */
function IconOf({ name }: { name: string }) {
  return name === "main" ? <Lock size={12} /> : <FlaskConical size={12} />;
}
