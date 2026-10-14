import { useState } from "react";
import { collectionProjectOptions, type Collection } from "../../mock-data/admin";
import { urlSafeName } from "../../utils/urlSafeName";
import Button from "../Button";
import { Select, TextInput } from "../Inputs";
import Modal from "../Modal";
import NameBadge from "../NameBadge";

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
  const formId = `collection-form-${collection?.id ?? "new"}`;

  return (
    <Modal
      open
      onClose={onCancel}
      size="xl"
      title={collection ? "Edit Collection" : "Create Collection"}
      footer={
        <>
          <Button id={`save-collection-${collection?.id ?? "new"}`} type="submit" form={formId} disabled={!name}>
            Save
          </Button>
          <Button theme="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </>
      }
    >
      <form id={formId} className="space-y-6" onSubmit={(e) => (e.preventDefault(), name && onSave(name, projectId))}>
        <div className="space-y-2">
          <TextInput
            id="collection_raw_name"
            label="Name"
            hint="Collection names must be unique across all projects within this instance. They are used in URLs and as titles, so duplicates are not allowed."
            required
            value={rawName}
            onChange={(e) => setRawName(e.target.value)}
          />
          <p className="text-xs text-gray-600">
            <NameBadge name={name}>This collection will be named</NameBadge>
          </p>
        </div>
        <Select
          id="collection_project_id"
          label="Project"
          required
          options={collectionProjectOptions}
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
      </form>
    </Modal>
  );
}
