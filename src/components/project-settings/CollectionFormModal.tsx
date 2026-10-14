import { useState } from "react";
import FormModal from "../FormModal";
import NameField from "../NameField";
import { urlSafeName } from "../../utils/format";

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
    <FormModal
      open
      onClose={onCancel}
      size="md"
      title={title}
      formId="collection-form"
      formClassName=""
      onSubmit={() => onSave(name)}
      submitLabel="Save"
      submitDisabled={!name}
    >
      <NameField
        id="collection_raw_name"
        required
        value={rawName}
        onChange={(raw) => setRawName(raw)}
        badgeLabel="Your collection will be named"
      />
    </FormModal>
  );
}
