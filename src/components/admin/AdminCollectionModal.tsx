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
      width="xl:min-w-1/3 min-w-1/2 max-w-1/2"
      title={<span className="font-bold">{collection ? "Edit Collection" : "Create Collection"}</span>}
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
      <form id={formId} onSubmit={(e) => (e.preventDefault(), name && onSave(name, projectId))}>
        <div className="container mx-auto space-y-6 bg-white">
          <div className="space-y-4">
            <TextInput
              id="collection_raw_name"
              label="Name"
              sublabel="Collection names must be unique across all projects within this instance. They are used in URLs and as titles, so duplicates are not allowed."
              required
              value={rawName}
              onChange={(e) => setRawName(e.target.value)}
            />
            <small className="mt-2 block text-xs text-gray-600">
              <NameBadge name={name}>This collection will be named</NameBadge>
            </small>
          </div>
          <div className="space-y-4">
            <Select
              id="collection_project_id"
              label="Project"
              required
              options={collectionProjectOptions}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
