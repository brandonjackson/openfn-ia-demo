import Button from "../Button";
import Modal from "../Modal";
import type { Collection } from "../../mock-data/project-settings";

interface Props {
  collection: Collection;
  onCancel: () => void;
  onDelete: () => void;
}

/** collections_component.ex `collection_deletion_modal`. */
export default function CollectionDeleteModal({ collection, onCancel, onDelete }: Props) {
  return (
    <Modal
      open
      onClose={onCancel}
      width="max-w-md"
      title="Delete collection"
      footer={
        <>
          <Button theme="danger" onClick={onDelete}>
            Delete
          </Button>
          <Button theme="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-500">
        Are you sure you want to delete the collection <span className="font-medium">{collection.name}</span> ? If you
        wish to proceed with this action, click on the delete button. To cancel click on the cancel button.
        <br />
        <br />
      </p>
    </Modal>
  );
}
