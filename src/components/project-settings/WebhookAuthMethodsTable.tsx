import TextLink from "../TextLink";
import { EmptyState, Table, Td, Th, Tr } from "../Table";
import Button from "../Button";
import { linkedUsageSummary } from "../../utils/format";
import type { WebhookAuthMethod } from "../../types/project-settings";

interface Props {
  authMethods: WebhookAuthMethod[];
  canWrite: boolean;
  onCreate: () => void;
  onView: (m: WebhookAuthMethod) => void;
  onDelete: (m: WebhookAuthMethod) => void;
  onShowUsage: (m: WebhookAuthMethod) => void;
}

const typeLabel = { api: "API", basic: "Basic" } as const;

/**
 * Lightning's `webhook_auth_methods_table` (workflow_live/components.ex)
 * with the project-settings slots from settings.html.heex: the linked
 * usage link and View / Delete actions.
 */
export default function WebhookAuthMethodsTable({ authMethods, canWrite, onCreate, onView, onDelete, onShowUsage }: Props) {
  if (authMethods.length === 0) {
    return (
      <EmptyState
        icon="hero-plus-circle"
        message="No auth methods found."
        buttonText="Create a new auth method"
        onClick={onCreate}
        disabled={!canWrite}
      />
    );
  }
  return (
    <Table
      header={
        <Tr>
          <Th>Name</Th>
          <Th>Type</Th>
          <Th>Linked Triggers &amp; Channels</Th>
          <Th actions />
        </Tr>
      }
    >
      {authMethods.map((m) => {
        const summary = linkedUsageSummary(m);
        return (
          <Tr key={m.id} id={m.id}>
            <Td className="max-w-60 truncate text-gray-900">{m.name}</Td>
            <Td className="text-gray-900">{typeLabel[m.authType]}</Td>
            <Td>
              {summary ? (
                <TextLink id={`display_linked_usage_link_${m.id}`} onClick={() => onShowUsage(m)}>
                  {summary}
                </TextLink>
              ) : (
                <span className="italic text-gray-300">No associated triggers or channels...</span>
              )}
            </Td>
            <Td actions>
              <Button theme="secondary" size="xs" disabled={!canWrite} onClick={() => onView(m)}>
                {canWrite ? "View" : "Edit"}
              </Button>
              <Button theme="secondary" size="xs" disabled={!canWrite} onClick={() => onDelete(m)}>
                Delete
              </Button>
            </Td>
          </Tr>
        );
      })}
    </Table>
  );
}
