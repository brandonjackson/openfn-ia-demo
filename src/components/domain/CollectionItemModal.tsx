import { useState } from "react";
import type { CollectionItem } from "../../model/page-data";
import { errorMessageOf } from "../../model/form-error";
import Modal from "../primitives/Modal";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import Stack from "../primitives/Stack";
import FormField from "../primitives/FormField";
import { TextArea, TextInput } from "../primitives/FormControls";

interface Props {
  /** Whether the modal shows. */
  open: boolean;
  /** The key being edited; without it, a new key is being added. */
  item?: CollectionItem;
  /** Keys already in the collection; a new key can't be one of them. */
  takenKeys: string[];
  onClose: () => void;
  /** Writes the key's value; resolves once written (the modal closes itself), or rejects with why not. */
  onSave: (key: string, value: string) => Promise<void>;
}

/**
 * Adding a key to a collection, or changing a key's value. Values are
 * stored as text, as Lightning stores them; most are JSON.
 */
export default function CollectionItemModal({ open, ...rest }: Props) {
  if (!open) return null;
  return <ItemForm {...rest} />;
}

function ItemForm({ item, takenKeys, onClose, onSave }: Omit<Props, "open">) {
  const [key, setKey] = useState(item?.key ?? "");
  const [value, setValue] = useState(item?.value ?? "");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refusal, setRefusal] = useState<string>();
  const keyError = item ? undefined : !key.trim() ? "Give it a key." : takenKeys.includes(key.trim()) ? "There's already a key with that name." : undefined;

  async function submit() {
    setTouched(true);
    if (keyError) return;
    setSaving(true);
    setRefusal(undefined);
    try {
      await onSave(item?.key ?? key.trim(), value);
      onClose();
    } catch (error) {
      setRefusal(errorMessageOf(error));
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      title={item ? `Edit ${item.key}` : "Add a key"}
      onClose={onClose}
      widthClass="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={saving}>
            {item ? "Save" : "Add key"}
          </Button>
        </>
      }
    >
      <Stack gap="lg">
        {refusal && <Callout variant="danger" title="Not saved">{refusal}</Callout>}
        {!item && (
          <FormField label="Key" htmlFor="collection-key" error={touched ? keyError : undefined} required>
            <TextInput id="collection-key" autoFocus value={key} placeholder="patient:12345" onChange={(e) => setKey(e.target.value)} />
          </FormField>
        )}
        <FormField label="Value" htmlFor="collection-value" hint="Stored as text. Workflows usually write JSON.">
          <TextArea id="collection-value" mono rows={10} autoFocus={!!item} value={value} onChange={(e) => setValue(e.target.value)} />
        </FormField>
      </Stack>
    </Modal>
  );
}
