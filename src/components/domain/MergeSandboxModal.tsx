import { useState } from "react";
import { GitMerge } from "lucide-react";
import type { SandboxItem, SandboxMerge } from "../../model/page-data";
import Modal from "../primitives/Modal";
import Button from "../primitives/Button";
import Stack from "../primitives/Stack";
import Inline from "../primitives/Inline";
import Text from "../primitives/Text";
import Badge from "../primitives/Badge";
import Callout from "../primitives/Callout";
import Checkbox from "../primitives/Checkbox";
import FormField from "../primitives/FormField";
import { Select } from "../primitives/FormControls";

interface Props {
  /** The sandbox to merge; the modal is closed without one. */
  sandbox?: SandboxItem;
  /** Where it can merge into: any sandbox but itself and the ones made from it. Its parent first. */
  targets: string[];
  onClose: () => void;
  onMerge: (merge: SandboxMerge) => Promise<void>;
}

/**
 * Merging a sandbox, as in Lightning: where into (its parent unless you pick
 * another), which of its changed workflows to bring, with a warning where
 * the target has changed one too, and which of its own credentials to bring.
 */
export default function MergeSandboxModal({ sandbox, ...rest }: Props) {
  if (!sandbox) return null;
  return <MergeForm key={sandbox.name} sandbox={sandbox} {...rest} />;
}

function MergeForm({ sandbox, targets, onClose, onMerge }: Props & { sandbox: SandboxItem }) {
  const [target, setTarget] = useState(sandbox.parent && targets.includes(sandbox.parent) ? sandbox.parent : targets[0]);
  const [workflowIds, setWorkflowIds] = useState(sandbox.changes.map((c) => c.workflowId));
  const [credentials, setCredentials] = useState(sandbox.credentials);
  const toggle = <T,>(list: T[], item: T, on: boolean) => (on ? [...list, item] : list.filter((x) => x !== item));
  const diverged = sandbox.changes.filter((c) => c.diverged && workflowIds.includes(c.workflowId));
  const nothing = workflowIds.length === 0 && credentials.length === 0;

  return (
    <Modal
      open
      title={`Merge ${sandbox.name}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            icon={GitMerge}
            disabled={nothing}
            onClick={async () => {
              await onMerge({ target, workflowIds, credentials });
              onClose();
            }}
          >
            {`Merge into ${target}`}
          </Button>
        </>
      }
    >
      <Stack gap="lg">
        <FormField label="Merge into" htmlFor="merge-target">
          <Select id="merge-target" options={targets} value={target} onChange={(e) => setTarget(e.target.value)} />
        </FormField>

        <Stack gap="sm">
          <Text tone="strong">Workflows</Text>
          {sandbox.changes.length === 0 ? (
            <Text tone="muted">No workflow has changed in this sandbox.</Text>
          ) : (
            sandbox.changes.map((c) => (
              <Inline key={c.workflowId} justify="between">
                <Checkbox
                  label={c.workflowName}
                  checked={workflowIds.includes(c.workflowId)}
                  onChange={(on) => setWorkflowIds((ids) => toggle(ids, c.workflowId, on))}
                />
                {c.diverged && <Badge label={`Changed in ${target} too`} tone="yellow" />}
              </Inline>
            ))
          )}
        </Stack>

        {diverged.length > 0 && (
          <Callout variant="warning" title={`${target} has changed since this sandbox was made`}>
            {`Merging replaces ${diverged.map((c) => c.workflowName).join(", ")} in ${target} with this sandbox's version, and the changes made in ${target} are lost.`}
          </Callout>
        )}

        {sandbox.credentials.length > 0 && (
          <Stack gap="sm">
            <Text tone="strong">Credentials only in this sandbox</Text>
            {sandbox.credentials.map((name) => (
              <Checkbox
                key={name}
                label={name}
                hint={`Bring it into ${target} so the merged workflows can use it.`}
                checked={credentials.includes(name)}
                onChange={(on) => setCredentials((list) => toggle(list, name, on))}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}
