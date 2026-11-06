import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type { ComponentPageData } from "../model/page-data";
import { isContentComponentType, type ComponentDraft } from "../model/project-components";
import { componentTypeIcons } from "../model/component-types";
import PageHeader from "../components/patterns/PageHeader";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import ComponentView from "../components/domain/ComponentView";
import ComponentFormModal from "../components/domain/ComponentFormModal";
import CollectionView from "../components/domain/CollectionView";
import CollectionNameModal from "../components/domain/CollectionNameModal";
import Badge from "../components/primitives/Badge";
import ConfirmModal from "../components/primitives/ConfirmModal";
import DropdownMenu from "../components/primitives/DropdownMenu";
import IconButton from "../components/primitives/IconButton";
import Stack from "../components/primitives/Stack";

export interface ComponentPageProps extends PageProps<ComponentPageData> {
  /** Saves a form's, artifact's, AI skill's, document's or static website's new content. Left out where you can't change it. */
  onSaveContent?: (content: string) => Promise<void>;
  /** Renames it and changes its description. Left out where you can't. */
  onEditDetails?: (draft: ComponentDraft) => Promise<void>;
  /** Renames a collection, to a URL-safe name. Left out where you can't. */
  onRenameCollection?: (name: string) => Promise<void>;
  /** Writes a collection key's value, adding the key if it's new. Left out where you can't. */
  onSaveItem?: (key: string, value: string) => Promise<void>;
  /** Deletes a collection key. Left out where you can't. */
  onDeleteItem?: (key: string) => Promise<void>;
  /** Deletes the component. Left out where you can't. */
  onDelete?: () => Promise<void>;
  /** Names used by the project's other components of this kind. */
  takenNames?: string[];
}

/**
 * A component's page in its project, opened from the project's Components:
 * the same view the workflow editor shows when it's opened from the code
 * explorer (`ComponentView` for a file, `CollectionView` for a collection's
 * keys), under the page's header, whose menu renames or deletes it.
 * Channels have their own page, `ChannelPage`.
 */
export default function ComponentPage({
  ancestors,
  data,
  onSaveContent,
  onEditDetails,
  onRenameCollection,
  onSaveItem,
  onDeleteItem,
  onDelete,
  takenNames = [],
}: ComponentPageProps) {
  const { component, content, collection } = data;
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const type = component.type;
  const canRename = isContentComponentType(type) ? !!onEditDetails : !!onRenameCollection;
  const menu = [
    ...(canRename ? [{ id: "edit", label: isContentComponentType(type) ? "Edit details" : "Rename", icon: Pencil }] : []),
    ...(onDelete ? [{ id: "delete", label: "Delete", icon: Trash2, tone: "danger" as const, divider: canRename }] : []),
  ];

  return (
    <Stack gap="xl">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={component.name} />}
        icon={componentTypeIcons[type]}
        title={component.name}
        badges={<Badge label={type} shape="tag" />}
        description={isContentComponentType(type) ? component.description : undefined}
        actions={
          menu.length > 0 && (
            <DropdownMenu
              ariaLabel={`Actions for ${component.name}`}
              align="right"
              widthClass="w-44"
              items={menu}
              onSelect={(id) => (id === "edit" ? setEditing(true) : setDeleting(true))}
              trigger={({ toggle }) => <IconButton icon={MoreVertical} label={`Actions for ${component.name}`} onClick={toggle} />}
            />
          )
        }
      />

      {content && isContentComponentType(type) && (
        <ComponentView
          key={component.id}
          variant="page"
          name={component.name}
          description={component.description}
          type={type}
          content={content}
          onSave={onSaveContent}
        />
      )}
      {collection && (
        <CollectionView
          variant="page"
          name={component.name}
          items={collection.items}
          itemCount={collection.itemCount}
          byteSize={collection.byteSize}
          onSaveItem={onSaveItem}
          onDeleteItem={onDeleteItem}
        />
      )}

      {onEditDetails && isContentComponentType(type) && (
        <ComponentFormModal
          open={editing}
          type={type}
          initial={{ name: component.name, description: component.description }}
          takenNames={takenNames}
          onClose={() => setEditing(false)}
          onSubmit={onEditDetails}
        />
      )}
      {onRenameCollection && type === "Collection" && (
        <CollectionNameModal open={editing} currentName={component.name} takenNames={takenNames} onClose={() => setEditing(false)} onSave={onRenameCollection} />
      )}
      {onDelete && (
        <ConfirmModal
          open={deleting}
          title={`Delete ${component.name}?`}
          confirmLabel={`Delete ${type.toLowerCase()}`}
          confirmPhrase={type === "Collection" ? component.name : undefined}
          onClose={() => setDeleting(false)}
          onConfirm={() => {
            setDeleting(false);
            void onDelete();
          }}
        >
          {type === "Collection"
            ? "Every key in it is deleted with it. Workflows that read from it will get nothing back."
            : "Workflows and assistants that use it will no longer find it. This can't be undone."}
        </ConfirmModal>
      )}
    </Stack>
  );
}
