import { useState } from "react";
import { collectionProjectOptions, type Collection } from "../../mock-data/admin";
import { urlSafeName } from "../../utils/format";
import FormModal from "../FormModal";
import { Select } from "../Inputs";
import NameField from "../NameField";

interface Props {
  /** The collection being edited; omit to create one. */
  collection?: Collection;
  onCancel: () => void;
  onSave: (name: string, projectId: string) => void;
}

/**
 * The superuser create / edit collection modal
 * (collection_live/collection_creation_modal.ex): a name, with the slug it
 * will get, and the project it belongs to.
 */
export default function AdminCollectionModal({ collection, onCancel, onSave }: Props) {
  const [rawName, setRawName] = useState(collection?.name ?? "");
  const [projectId, setProjectId] = useState(collection?.projectId ?? collectionProjectOptions[0]?.[1] ?? "");
  const name = urlSafeName(rawName);

  return (
    <FormModal
      open
      onClose={onCancel}
      size="xl"
      title={collection ? "Edit Collection" : "Create Collection"}
      formId={`collection-form-${collection?.id ?? "new"}`}
      onSubmit={() => onSave(name, projectId)}
      submitLabel="Save"
      submitId={`save-collection-${collection?.id ?? "new"}`}
      submitDisabled={!name}
    >
      <NameField
        id="collection_raw_name"
        hint="Collection names must be unique across all projects within this instance. They are used in URLs and as titles, so duplicates are not allowed."
        required
        value={rawName}
        onChange={(raw) => setRawName(raw)}
        badgeLabel="This collection will be named"
      />
      <Select
        id="collection_project_id"
        label="Project"
        required
        options={collectionProjectOptions}
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
      />
    </FormModal>
  );
}
