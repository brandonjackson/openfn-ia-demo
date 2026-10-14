import { useState } from "react";
import Button from "../Button";
import { TextInput } from "../Inputs";
import Modal from "../Modal";
import NameBadge from "../NameBadge";
import { urlSafeName } from "../../utils/urlSafeName";

interface Props {
  /** "Create Collection" or "Edit Collection". */
  title: string;
  initialName?: string;
  onCancel: () => void;
  onSave: (name: string) => void;
}

/** Create / edit collection modal (collections_component.ex `form_modal_component`). */
export default function CollectionFormModal({ title, initialName = "", onCancel, onSave }: Props) {
  const [rawName, setRawName] = useState(initialName);
  const name = urlSafeName(rawName);
  return (
    <Modal
      open
      onClose={onCancel}
      size="md"
      title={title}
      footer={
        <>
          <Button type="submit" form="collection-form" disabled={!name}>
            Save
          </Button>
          <Button theme="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </>
      }
    >
      <form id="collection-form" onSubmit={(e) => (e.preventDefault(), name && onSave(name))}>
        <div className="space-y-2">
          <TextInput
            id="collection_raw_name"
            label="Name"
            required
            value={rawName}
            onChange={(e) => setRawName(e.target.value)}
          />
          <small className="block text-xs text-gray-600">
            <NameBadge name={name}>Your collection will be named</NameBadge>
          </small>
        </div>
      </form>
    </Modal>
  );
}
