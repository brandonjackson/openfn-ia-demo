import { Globe, Pencil, Trash2 } from "lucide-react";
import type { OAuthClient, ProjectOption } from "../../model/page-data";
import DataTable from "../primitives/DataTable";
import type { DataTableColumn } from "../primitives/DataTable";
import type { DropdownMenuItem } from "../primitives/DropdownMenu";
import ActionMenu from "../primitives/ActionMenu";
import Badge from "../primitives/Badge";
import Text from "../primitives/Text";

interface Props {
  clients: OAuthClient[];
  /** Projects by id, to name the ones each client is shared with. */
  projects: ProjectOption[];
  /** Opens the client's form. Left out, there's no Edit. */
  onEdit?: (client: OAuthClient) => void;
  /** Asks to delete it. Left out, there's no Delete. */
  onDelete?: (client: OAuthClient) => void;
}

/**
 * OAuth clients you've registered: each one's name, who can use it (every
 * project when it's global) and where people sign in, with a ⋮ for editing
 * and deleting it.
 */
export default function OAuthClientTable({ clients, projects, onEdit, onDelete }: Props) {
  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? id;

  const items: DropdownMenuItem[] = [
    ...(onEdit ? [{ id: "edit", label: "Edit", icon: Pencil }] : []),
    ...(onDelete ? [{ id: "delete", label: "Delete", icon: Trash2, tone: "danger" as const, divider: Boolean(onEdit) }] : []),
  ];

  const columns: DataTableColumn<OAuthClient>[] = [
    { key: "name", header: "Name", render: (c) => <Text tone="strong">{c.name}</Text> },
    {
      key: "projects",
      header: "Projects with access",
      render: (c) =>
        c.global ? (
          <Badge label="Global" tone="indigo" icon={Globe} />
        ) : c.projectIds.length > 0 ? (
          <Text>{c.projectIds.map(projectName).join(", ")}</Text>
        ) : (
          <Text tone="subtle">None</Text>
        ),
    },
    {
      key: "authorization",
      header: "Authorization URL",
      render: (c) => (
        <Text size="xs" mono truncate>
          {c.authorizationEndpoint}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (c) =>
        items.length > 0 && (
          <ActionMenu
            label={`Actions for ${c.name}`}
            items={items}
            onSelect={(id) => (id === "edit" ? onEdit?.(c) : onDelete?.(c))}
          />
        ),
    },
  ];

  return <DataTable columns={columns} rows={clients} getRowKey={(c) => c.id} emptyMessage="No OAuth clients yet." />;
}
