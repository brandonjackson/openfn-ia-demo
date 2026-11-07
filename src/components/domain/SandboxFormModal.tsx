import { useState } from "react";
import { type SandboxColor, type SandboxDraft, type SandboxItem, SANDBOX_COLORS, sandboxNameError, sandboxSlug } from "../../model/sandboxes";
import Modal from "../primitives/Modal";
import Button from "../primitives/Button";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import FormField from "../primitives/FormField";
import { Select, TextInput } from "../primitives/FormControls";
import SwatchPicker from "../primitives/SwatchPicker";

interface Props {
  open: boolean;
  /** The sandbox being edited; without it, a new one is being made. */
  sandbox?: SandboxItem;
  /** Every sandbox in the project, for the parent to pick and the names already taken. */
  sandboxes: SandboxItem[];
  /** The sandbox a new one is made from unless another is picked, usually the one you're in. */
  defaultParent?: string;
  onClose: () => void;
  onSubmit: (draft: SandboxDraft) => Promise<void>;
}

/**
 * Making a sandbox, or renaming and recolouring one: a name (shown as the
 * slug it becomes), a colour, and for a new one, the sandbox to copy.
 */
export default function SandboxFormModal({ open, ...rest }: Props) {
  if (!open) return null;
  return <SandboxForm key={rest.sandbox?.name ?? "new"} {...rest} />;
}

function SandboxForm({ sandbox, sandboxes, defaultParent = "main", onClose, onSubmit }: Omit<Props, "open">) {
  const editing = !!sandbox;
  const [name, setName] = useState(sandbox?.name ?? "");
  const [color, setColor] = useState<SandboxColor>(sandbox?.color ?? SANDBOX_COLORS[sandboxes.length % SANDBOX_COLORS.length]);
  const [parent, setParent] = useState(defaultParent);
  const [touched, setTouched] = useState(false);
  const taken = sandboxes.map((s) => s.name).filter((n) => n !== sandbox?.name);
  const error = sandboxNameError(name, taken);
  const slug = sandboxSlug(name);

  async function submit() {
    setTouched(true);
    if (error) return;
    await onSubmit({ name, color, parent: editing ? undefined : parent });
    onClose();
  }

  return (
    <Modal
      open
      title={editing ? `Edit ${sandbox.name}` : "New sandbox"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={touched && !!error}>
            {editing ? "Save" : "Create sandbox"}
          </Button>
        </>
      }
    >
      <Stack gap="lg">
        <FormField
          label="Name"
          htmlFor="sandbox-name"
          hint={touched && error ? undefined : `Your sandbox will be named ${slug || "my-sandbox"}.`}
          error={touched ? error : undefined}
        >
          <TextInput
            id="sandbox-name"
            placeholder="My sandbox"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
          />
        </FormField>
        {!editing && (
          <FormField label="Make it from" htmlFor="sandbox-parent" hint="It starts as a copy of this sandbox's workflows, and merges back into it.">
            <Select id="sandbox-parent" options={sandboxes.map((s) => s.name)} value={parent} onChange={(e) => setParent(e.target.value)} />
          </FormField>
        )}
        <Stack gap="sm">
          <Text tone="strong">Colour</Text>
          <SwatchPicker label="Colour" options={SANDBOX_COLORS} value={color} onChange={setColor} />
          <Text tone="muted" size="xs">
            Shown beside its name, so you can tell at a glance which sandbox you're in.
          </Text>
        </Stack>
      </Stack>
    </Modal>
  );
}
