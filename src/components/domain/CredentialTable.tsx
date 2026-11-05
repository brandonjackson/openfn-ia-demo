import { ArrowRightLeft, Braces, Clock, Pencil, Trash2, Undo2 } from "lucide-react";
import type { CredentialSchema, ProjectOption, UserCredential } from "../../model/page-data";
import DataTable from "../primitives/DataTable";
import type { DataTableColumn } from "../primitives/DataTable";
import type { DropdownMenuItem } from "../primitives/DropdownMenu";
import ActionMenu from "../primitives/ActionMenu";
import Badge from "../primitives/Badge";
import Inline from "../primitives/Inline";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import EnvironmentBadge from "./EnvironmentBadge";
import SystemLabel from "./SystemLabel";

interface Props {
  credentials: UserCredential[];
  /** The kinds of credential, to name and draw each one's type. */
  schemas: CredentialSchema[];
  /** Projects by id, to name the ones each credential is shared with. */
  projects: ProjectOption[];
  /** Opens the credential's form. Left out, there's no Edit. */
  onEdit?: (credential: UserCredential) => void;
  /** Starts handing it to someone else, or revokes a pending transfer. Left out, there's no Transfer. */
  onTransfer?: (credential: UserCredential) => void;
  /** Asks to delete it. Left out, there's no Delete. */
  onDelete?: (credential: UserCredential) => void;
}

/**
 * The credentials you own: each one's name (and external ID), its type with
 * the adaptor's logo, the projects that can use it and the environments it
 * has values for, with a ⋮ for editing, transferring and deleting it. A
 * credential being handed to someone shows who it's waiting on.
 */
export default function CredentialTable({ credentials, schemas, projects, onEdit, onTransfer, onDelete }: Props) {
  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? id;

  const menu = (c: UserCredential): DropdownMenuItem[] => [
    ...(onEdit ? [{ id: "edit", label: "Edit", icon: Pencil }] : []),
    ...(onTransfer
      ? [c.transferPendingTo ? { id: "transfer", label: "Revoke transfer", icon: Undo2 } : { id: "transfer", label: "Transfer", icon: ArrowRightLeft }]
      : []),
    ...(onDelete ? [{ id: "delete", label: "Delete", icon: Trash2, tone: "danger" as const, divider: Boolean(onEdit || onTransfer) }] : []),
  ];

  const columns: DataTableColumn<UserCredential>[] = [
    {
      key: "name",
      header: "Name",
      render: (c) => (
        <Stack gap="none">
          <Inline gap="sm" wrap>
            <Text tone="strong">{c.name}</Text>
            {c.transferPendingTo && <Badge label="Transfer pending" tone="yellow" icon={Clock} />}
          </Inline>
          {c.transferPendingTo && (
            <Text size="xs" tone="muted">
              Waiting for {c.transferPendingTo} to accept
            </Text>
          )}
          {c.externalId && (
            <Text size="xs" tone="subtle" mono>
              {c.externalId}
            </Text>
          )}
        </Stack>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (c) => {
        const schema = schemas.find((s) => s.id === c.schema);
        if (!schema?.adaptor) return <Badge label={schema?.name ?? c.schema} icon={Braces} />;
        return <SystemLabel name={schema.name} adaptor={schema.adaptor} />;
      },
    },
    {
      key: "projects",
      header: "Projects with access",
      // Plain text rather than chips, so a long project name wraps instead of pushing the table wide.
      render: (c) =>
        c.projectIds.length > 0 ? <Text>{c.projectIds.map(projectName).join(", ")}</Text> : <Text tone="subtle">None</Text>,
    },
    {
      key: "environments",
      header: "Environments",
      render: (c) => (
        <Inline gap="xs" wrap>
          {c.environments.map((e) => (
            <EnvironmentBadge key={e.environment} environment={e.environment} />
          ))}
        </Inline>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (c) =>
        menu(c).length > 0 && (
          <ActionMenu
            label={`Actions for ${c.name}`}
            items={menu(c)}
            onSelect={(id) => {
              if (id === "edit") onEdit?.(c);
              if (id === "transfer") onTransfer?.(c);
              if (id === "delete") onDelete?.(c);
            }}
          />
        ),
    },
  ];

  return <DataTable columns={columns} rows={credentials} getRowKey={(c) => c.id} emptyMessage="You don't own any credentials yet." />;
}
