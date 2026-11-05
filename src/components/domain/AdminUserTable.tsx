import { LifeBuoy, MoreVertical } from "lucide-react";
import type { AdminUser } from "../../model/page-data";
import { fullName, instanceRoleLabels } from "../../model/admin";
import Badge from "../primitives/Badge";
import DataTable from "../primitives/DataTable";
import type { DataTableColumn } from "../primitives/DataTable";
import DropdownMenu from "../primitives/DropdownMenu";
import type { DropdownMenuItem } from "../primitives/DropdownMenu";
import IconButton from "../primitives/IconButton";
import Inline from "../primitives/Inline";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  /** Disables or enables an account. Your own account can't be disabled. */
  onSetDisabled: (user: AdminUser, disabled: boolean) => void;
  /** Asks to delete an account after the grace period. Offered when the user's `canDelete`. */
  onScheduleDeletion: (user: AdminUser) => void;
  onCancelDeletion: (user: AdminUser) => void;
  /** Asks to delete an account right away. Offered once a deletion is scheduled, when the user's `canDeleteNow`. */
  onDeleteNow: (user: AdminUser) => void;
  /** Shown when no user matches, e.g. a search with no results. */
  emptyMessage?: string;
}

function deleteReason(user: AdminUser): string | undefined {
  if (user.canDelete) return undefined;
  if (user.isSelf) return "You can't delete your own account";
  if (user.role === "superuser") return "Superusers can't be deleted";
  return "Can't be deleted";
}

function actionsFor(user: AdminUser): DropdownMenuItem[] {
  const items: DropdownMenuItem[] = [
    { id: "edit", label: "Edit" },
    {
      id: user.disabled ? "enable" : "disable",
      label: user.disabled ? "Enable" : "Disable",
      description: user.disabled ? undefined : "They won't be able to log in",
      disabled: user.isSelf,
    },
  ];
  if (user.scheduledDeletion) {
    items.push(
      { id: "cancel-deletion", label: "Cancel deletion", divider: true },
      {
        id: "delete-now",
        label: "Delete now",
        tone: "danger",
        disabled: !user.canDeleteNow,
        description: user.canDeleteNow ? undefined : "Not while they have activity in projects",
      }
    );
  } else {
    items.push({
      id: "delete",
      label: "Delete",
      tone: "danger",
      divider: true,
      disabled: !user.canDelete,
      description: deleteReason(user),
    });
  }
  return items;
}

/**
 * Every account on the instance, for a superuser: who they are, their reach
 * (user or superuser, and whether they're a support user), whether they can
 * log in or are due to be deleted, and when they last logged in. Each row's
 * ⋮ menu edits, disables, or deletes the account, offering only what the
 * account allows.
 */
export default function AdminUserTable({
  users,
  onEdit,
  onSetDisabled,
  onScheduleDeletion,
  onCancelDeletion,
  onDeleteNow,
  emptyMessage = "No users yet.",
}: Props) {
  const select = (user: AdminUser, id: string) => {
    if (id === "edit") onEdit(user);
    if (id === "disable") onSetDisabled(user, true);
    if (id === "enable") onSetDisabled(user, false);
    if (id === "delete") onScheduleDeletion(user);
    if (id === "cancel-deletion") onCancelDeletion(user);
    if (id === "delete-now") onDeleteNow(user);
  };

  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: "name",
      header: "Name",
      render: (u) => (
        <Stack gap="none">
          <Inline gap="xs">
            <Text tone="strong">{fullName(u)}</Text>
            {u.isSelf && <Text tone="subtle">(you)</Text>}
          </Inline>
          <Text tone="muted" size="xs">
            {u.email}
          </Text>
        </Stack>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <Inline gap="xs" wrap>
          <Badge label={instanceRoleLabels[u.role]} tone={u.role === "superuser" ? "indigo" : "gray"} />
          {u.supportUser && <Badge label="Support" icon={LifeBuoy} tone="pink" />}
        </Inline>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Inline gap="xs" wrap>
          {u.disabled ? <Badge label="Disabled" /> : <Badge label="Enabled" tone="green" />}
          {u.scheduledDeletion && <Badge label={`Deletes ${u.scheduledDeletion}`} tone="red" />}
        </Inline>
      ),
    },
    {
      key: "last-login",
      header: "Last login",
      render: (u) => <Text tone={u.lastLogin ? "muted" : "subtle"}>{u.lastLogin ?? "Never"}</Text>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (u) => (
        <DropdownMenu
          ariaLabel={`Actions for ${fullName(u)}`}
          align="right"
          items={actionsFor(u)}
          onSelect={(id) => select(u, id)}
          trigger={({ open, toggle }) => (
            <IconButton
              icon={MoreVertical}
              label={`Actions for ${fullName(u)}`}
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

  return <DataTable columns={columns} rows={users} getRowKey={(u) => u.id} emptyMessage={emptyMessage} />;
}
