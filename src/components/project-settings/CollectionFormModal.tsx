import { useState } from "react";
import Button from "../Button";
import { Label, TextInput } from "../Inputs";
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
      width="xl:min-w-1/3 min-w-1/2 max-w-full"
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
        <div className="container mx-auto space-y-6 bg-white">
          <div className="space-y-4">
            <div>
              <Label htmlFor="collection_raw_name">
                Name<span className="text-red-500"> *</span>
              </Label>
              <TextInput
              id="collection_raw_name"
              required
              value={rawName}
              onChange={(e) => setRawName(e.target.value)}
              />
            </div>
            <small className="mt-2 block text-xs text-gray-600">
              <NameBadge name={name}>Your collection will be named</NameBadge>
            </small>
          </div>
        </div>
      </form>
    </Modal>
  );
}
