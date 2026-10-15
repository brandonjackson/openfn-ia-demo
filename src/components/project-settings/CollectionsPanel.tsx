import { useState } from "react";
import Button from "../Button";
import SectionHeader from "../SectionHeader";
import { useToast } from "../Toast";
import CollectionDeleteModal from "./CollectionDeleteModal";
import CollectionFormModal from "./CollectionFormModal";
import CollectionPreviewModal from "./CollectionPreviewModal";
import CollectionsTable from "./CollectionsTable";
import SandboxSettingsBanner from "./SandboxSettingsBanner";
import type { Collection } from "../../types/project-settings";

interface Props {
  projectId: string;
  initialCollections: Collection[];
  canCreateCollection: boolean;
  sandbox?: boolean;
}

type Action = { kind: "new" } | { kind: "edit" | "delete" | "preview"; collection: Collection } | null;

/**
 * The Collections tab (`#collections`, project_live/collections_component.ex).
 * Create, edit and delete change local state only.
 */
export default function CollectionsPanel({ projectId, initialCollections, canCreateCollection, sandbox = false }: Props) {
  const [items, setItems] = useState(initialCollections);
  const [action, setAction] = useState<Action>(null);
  const close = () => setAction(null);
  const toast = useToast();

  return (
    <div id="collections" className="space-y-4">
      <SectionHeader
        title="Project collections"
        subtitle="Manage collections for this project."
        permissionsSection={canCreateCollection ? undefined : "available collections."}
        action={
          <Button
            id="open-create-collection-modal-button"
            size="lg"
            disabled={!canCreateCollection}
            onClick={() => setAction({ kind: "new" })}
          >
            Create collection
          </Button>
        }
      />
      {sandbox && <SandboxSettingsBanner variant="editable" />}

      {action?.kind === "new" && (
        <CollectionFormModal
          title="Create Collection"
          onCancel={close}
          onSave={(name) => {
            setItems([...items, { id: `col-${Date.now()}`, projectId, name, byteSizeSum: 0, previewJson: null }]);
            close();
            toast("Collection created");
          }}
        />
      )}
      {action?.kind === "edit" && (
        <CollectionFormModal
          title="Edit Collection"
          initialName={action.collection.name}
          onCancel={close}
          onSave={(name) => {
            setItems(items.map((c) => (c.id === action.collection.id ? { ...c, name } : c)));
            close();
            toast("Collection updated");
          }}
        />
      )}
      {action?.kind === "delete" && (
        <CollectionDeleteModal
          collection={action.collection}
          onCancel={close}
          onDelete={() => {
            setItems(items.filter((c) => c.id !== action.collection.id));
            close();
            toast("Collection deleted");
          }}
        />
      )}
      {action?.kind === "preview" && <CollectionPreviewModal collection={action.collection} onClose={close} />}

      <CollectionsTable
        collections={items}
        canCreateCollection={canCreateCollection}
        onCreate={() => setAction({ kind: "new" })}
        onPreview={(collection) => setAction({ kind: "preview", collection })}
        onEdit={(collection) => setAction({ kind: "edit", collection })}
        onDelete={(collection) => setAction({ kind: "delete", collection })}
      />
    </div>
  );
}
