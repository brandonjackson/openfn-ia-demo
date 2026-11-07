import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import type { WebhookAuthMethod, WebhookTriggerOption } from "../../model/webhooks";
import { countLabel, webhookAuthTypes } from "../../model/project-settings";
import DataTable, { type DataTableColumn } from "../primitives/DataTable";
import Badge from "../primitives/Badge";
import Button from "../primitives/Button";
import EmptyState from "../primitives/EmptyState";
import Inline from "../primitives/Inline";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  methods: WebhookAuthMethod[];
  /** The project's webhook triggers, to name the ones each method protects. */
  triggers: WebhookTriggerOption[];
  /** Opens a method to rename it or change its triggers. Left out when you can't. */
  onEdit?: (method: WebhookAuthMethod) => void;
  /** Asks to delete a method. Left out when you can't. */
  onDelete?: (method: WebhookAuthMethod) => void;
  /** Starts a new method from the empty state. Left out when you can't. */
  onCreate?: () => void;
}

/**
 * A project's webhook auth methods: each one's name, whether it's basic auth
 * or an API key, and which workflows' webhook triggers require it.
 */
export default function WebhookAuthMethodTable({ methods, triggers, onEdit, onDelete, onCreate }: Props) {
  if (methods.length === 0)
    return (
      <EmptyState
        icon={PlusCircle}
        title="No auth methods found."
        description="Add one to require a username and password, or an API key, on calls to your webhook triggers."
        action={onCreate && <Button onClick={onCreate}>Create a new auth method</Button>}
      />
    );

  const workflowName = (id: string) => triggers.find((t) => t.id === id)?.workflowName ?? id;
  const columns: DataTableColumn<WebhookAuthMethod>[] = [
    { key: "name", header: "Name", render: (m) => <Text tone="strong">{m.name}</Text> },
    {
      key: "type",
      header: "Type",
      render: (m) => <Badge label={webhookAuthTypes[m.type].label} tone={m.type === "api" ? "indigo" : "gray"} />,
    },
    {
      key: "triggers",
      header: "Linked triggers",
      render: (m) =>
        m.triggerIds.length === 0 ? (
          <Text tone="subtle">No associated triggers</Text>
        ) : (
          <Stack gap="none">
            <Text>{countLabel(m.triggerIds.length, "trigger")}</Text>
            <Text tone="muted" size="xs" mono>
              {m.triggerIds.map(workflowName).join(", ")}
            </Text>
          </Stack>
        ),
    },
  ];
  if (onEdit || onDelete)
    columns.push({
      key: "actions",
      header: "",
      align: "right",
      render: (m) => (
        <Inline gap="sm" justify="end">
          {onEdit && (
            <Button variant="secondary" size="xs" icon={Pencil} onClick={() => onEdit(m)}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="outline-danger" size="xs" icon={Trash2} onClick={() => onDelete(m)}>
              Delete
            </Button>
          )}
        </Inline>
      ),
    });

  return <DataTable columns={columns} rows={methods} getRowKey={(m) => m.id} />;
}
