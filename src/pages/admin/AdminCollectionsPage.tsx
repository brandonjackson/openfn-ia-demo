import { useState } from "react";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import AdminCollectionModal from "../../components/admin/AdminCollectionModal";
import AdminCollectionsTable from "../../components/admin/AdminCollectionsTable";
import CollectionDeleteModal from "../../components/project-settings/CollectionDeleteModal";
import { useToast } from "../../components/Toast";
import { collections, type Collection } from "../../mock-data/admin";

type Dialog = { kind: "create" } | { kind: "edit"; collection: Collection } | { kind: "delete"; collection: Collection };

/** Inventory view `admin-collections` (CollectionLive.Index): /settings/collections. */
export default function AdminCollectionsPage() {
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const close = () => setDialog(null);
  const toast = useToast();
  const closeWith = (message: string) => () => {
    close();
    toast(message);
  };

  return (
    <PageContent header={<Header title="Collections" />}>
      <Centered>
        <AdminCollectionsTable
          collections={collections}
          onCreate={() => setDialog({ kind: "create" })}
          onEdit={(collection) => setDialog({ kind: "edit", collection })}
          onDelete={(collection) => setDialog({ kind: "delete", collection })}
        />
        {dialog?.kind === "create" && (
          <AdminCollectionModal onCancel={close} onSave={closeWith("Collection created successfully")} />
        )}
        {dialog?.kind === "edit" && (
          <AdminCollectionModal
            collection={dialog.collection}
            onCancel={close}
            onSave={closeWith("Collection updated successfully")}
          />
        )}
        {dialog?.kind === "delete" && (
          <CollectionDeleteModal
            collection={dialog.collection}
            onCancel={close}
            onDelete={closeWith("Collection deleted")}
          />
        )}
      </Centered>
    </PageContent>
  );
}
