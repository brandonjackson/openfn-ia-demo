import { MoreVertical } from "lucide-react";
import type { AdminProject } from "../../model/projects";
import type { AdminUser } from "../../model/users";
import { fullName } from "../../model/admin";
import Badge from "../primitives/Badge";
import DataTable from "../primitives/DataTable";
import type { DataTableColumn } from "../primitives/DataTable";
import DropdownMenu from "../primitives/DropdownMenu";
import type { DropdownMenuItem } from "../primitives/DropdownMenu";
import IconButton from "../primitives/IconButton";
import Inline from "../primitives/Inline";
import Text from "../primitives/Text";

interface Props {
  projects: AdminProject[];
  /** Everyone on the instance, to name each project's owner. */
  users: AdminUser[];
  onEdit: (project: AdminProject) => void;
  /** Asks to delete a project after the grace period. */
  onScheduleDeletion: (project: AdminProject) => void;
  onCancelDeletion: (project: AdminProject) => void;
  /**
   * Asks to delete a project right away, once its deletion is scheduled.
   * Left out where the server only schedules deletions (Lightning's API has
   * no immediate purge), and the menu doesn't offer it.
   */
  onDeleteNow?: (project: AdminProject) => void;
  /** Shown when no project matches, e.g. a search with no results. */
  emptyMessage?: string;
}

function actionsFor(project: AdminProject, canDeleteNow: boolean): DropdownMenuItem[] {
  return project.scheduledDeletion
    ? [
        { id: "edit", label: "Edit" },
        { id: "cancel-deletion", label: "Cancel deletion", divider: true },
        ...(canDeleteNow ? [{ id: "delete-now", label: "Delete now", tone: "danger" as const }] : []),
      ]
    : [
        { id: "edit", label: "Edit" },
        { id: "delete", label: "Delete", tone: "danger", divider: true },
      ];
}

/**
 * Every project on the instance, for a superuser: its owner, how many
 * members it has, when it was created and whether it's due to be deleted.
 * Each row's ⋮ menu edits the project or deletes it.
 */
export default function AdminProjectTable({
  projects,
  users,
  onEdit,
  onScheduleDeletion,
  onCancelDeletion,
  onDeleteNow,
  emptyMessage = "No projects yet.",
}: Props) {
  const ownerOf = (project: AdminProject) => {
    const owner = project.members.find((m) => m.role === "owner");
    const user = owner && users.find((u) => u.id === owner.userId);
    return user ? fullName(user) : undefined;
  };
  const select = (project: AdminProject, id: string) => {
    if (id === "edit") onEdit(project);
    if (id === "delete") onScheduleDeletion(project);
    if (id === "cancel-deletion") onCancelDeletion(project);
    if (id === "delete-now") onDeleteNow?.(project);
  };

  const columns: DataTableColumn<AdminProject>[] = [
    {
      key: "name",
      header: "Project",
      render: (p) => (
        <Inline gap="sm" wrap>
          <Text tone="strong">{p.name}</Text>
          {p.scheduledDeletion && <Badge label={`Deletes ${p.scheduledDeletion}`} tone="red" />}
        </Inline>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: (p) => {
        const owner = ownerOf(p);
        return <Text tone={owner ? "default" : "subtle"}>{owner ?? "No owner"}</Text>;
      },
    },
    {
      key: "members",
      header: "Members",
      align: "right",
      render: (p) => <Text>{p.members.length}</Text>,
    },
    { key: "created", header: "Created", render: (p) => <Text tone="muted">{p.createdAt}</Text> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (p) => (
        <DropdownMenu
          ariaLabel={`Actions for ${p.name}`}
          align="right"
          items={actionsFor(p, !!onDeleteNow)}
          onSelect={(id) => select(p, id)}
          trigger={({ open, toggle }) => (
            <IconButton
              icon={MoreVertical}
              label={`Actions for ${p.name}`}
              aria-haspopup="menu"
              aria-expanded={open}
              active={open}
              onClick={toggle}
            />
          )}
        />
      ),
    },
  ];

  return <DataTable columns={columns} rows={projects} getRowKey={(p) => p.id} emptyMessage={emptyMessage} />;
}
