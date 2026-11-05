import { useState } from "react";
import { collectionNameError, urlSafeName } from "../../model/project-settings";
import Modal from "../primitives/Modal";
import Button from "../primitives/Button";
import FormField from "../primitives/FormField";
import Text from "../primitives/Text";
import { TextInput } from "../primitives/FormControls";

interface Props {
  open: boolean;
  onClose: () => void;
  /** The collection's current name, when renaming; leave it out to make a new one. */
  currentName?: string;
  /** The project's other collection names; a name must be unique. */
  takenNames: string[];
  /** Saves the URL-safe name. Resolves once saved; the modal closes itself. */
  onSave: (name: string) => Promise<void>;
}

/**
 * Names a new collection, or renames one. Whatever's typed is made URL safe
 * the way Lightning does it, and the result is shown before saving.
 */
export default function CollectionNameModal({ open, ...rest }: Props) {
  if (!open) return null;
  return <NameForm {...rest} />;
}

function NameForm({ onClose, currentName, takenNames, onSave }: Omit<Props, "open">) {
  const [raw, setRaw] = useState(currentName ?? "");
  const [saving, setSaving] = useState(false);
  const name = urlSafeName(raw);
  const error = raw ? collectionNameError(name, takenNames) : undefined;
  const valid = !!raw && !error && name !== currentName;

  const save = async () => {
    setSaving(true);
    await onSave(name);
    onClose();
  };

  return (
    <Modal
      open
      title={currentName ? "Rename collection" : "Create collection"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid || saving} onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <FormField
        label="Name"
        htmlFor="collection-name"
        error={error}
        hint={
          name && (
            <>
              Your collection will be named <Text mono>{name}</Text>.
            </>
          )
        }
      >
        <TextInput
          id="collection-name"
          autoFocus
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && valid) save();
          }}
        />
      </FormField>
    </Modal>
  );
}
