import Modal from "../Modal";
import { linkClass } from "./classes";
import type { Collection } from "../../mock-data/project-settings";

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
      width="max-w-3xl"
      title={`Collection Preview: ${collection.name}`}
      subtitle={
        <span className="text-sm text-gray-500">
          Showing first record. We recommend{" "}
          <a
            href="https://docs.openfn.org/documentation/collections-cli"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            using the CLI
          </a>{" "}
          to manage collections.
        </span>
      }
    >
      <div className="h-96 rounded-md overflow-hidden">
        {collection.previewJson ? (
          <pre className="h-full overflow-auto bg-slate-700 p-4 font-mono text-xs text-slate-200">
            {collection.previewJson}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">This collection is empty.</div>
        )}
      </div>
    </Modal>
  );
}
