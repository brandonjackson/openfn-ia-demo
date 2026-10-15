import Modal from "../Modal";
import TextLink from "../TextLink";
import type { Collection } from "../../types/project-settings";

interface Props {
  collection: Collection;
  onClose: () => void;
}

/**
 * collections_component.ex `collection_preview_modal`: the first record as
 * JSON. Lightning renders it in a Monaco viewer; this uses a plain <pre>.
 */
export default function CollectionPreviewModal({ collection, onClose }: Props) {
  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={`Collection Preview: ${collection.name}`}
      description={
        <>
          Showing first record. We recommend{" "}
          <TextLink href="https://docs.openfn.org/documentation/collections-cli" external>
            using the CLI
          </TextLink>{" "}
          to manage collections.
        </>
      }
    >
      {collection.previewJson ? (
        <pre className="h-96 overflow-auto rounded-md bg-gray-700 p-4 text-xs text-gray-200">{collection.previewJson}</pre>
      ) : (
        <p className="flex h-96 items-center justify-center text-sm text-gray-400">This collection is empty.</p>
      )}
    </Modal>
  );
}
