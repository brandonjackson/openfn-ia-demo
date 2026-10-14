import { EmptyState, Table, Td, Th, Tr } from "../Table";
import { tableActionClass } from "./classes";
import { linkedUsageSummary, type WebhookAuthMethod } from "../../mock-data/project-settings";
import { cn } from "../../utils/cn";

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
  const action = cn(tableActionClass, !canWrite && "cursor-not-allowed");
  return (
    <Table
      header={
        <Tr>
          <Th className="min-w-[10rem] py-2.5 text-left text-sm font-normal text-gray-900 pl-4">Name</Th>
          <Th className="min-w-[7rem] py-2.5 text-left text-sm font-normal text-gray-900">Type</Th>
          <Th className="min-w-[10rem] py-2.5 text-left text-sm font-normal text-gray-900">
            Linked Triggers &amp; Channels
          </Th>
          <Th className="min-w-[4rem] py-2.5 text-right text-sm font-normal text-gray-900" />
        </Tr>
      }
    >
      {authMethods.map((m) => {
        const summary = linkedUsageSummary(m);
        return (
          <Tr key={m.id} id={m.id}>
            <Td className="whitespace-nowrap py-2.5 text-sm text-gray-900 text-ellipsis overflow-hidden max-w-[15rem] pr-5 pl-4">
              {m.name}
            </Td>
            <Td className="whitespace-nowrap text-sm text-gray-900">
              <span>{typeLabel[m.authType]}</span>
            </Td>
            <Td className="whitespace-nowrap text-sm text-gray-900">
              <span className="relative font-normal">
                {summary ? (
                  <a
                    id={`display_linked_usage_link_${m.id}`}
                    href="#webhook_security"
                    className="text-indigo-600 hover:text-indigo-900"
                    onClick={(e) => (e.preventDefault(), onShowUsage(m))}
                  >
                    {summary}
                  </a>
                ) : (
                  <span className="italic font-normal text-gray-300">No associated triggers or channels...</span>
                )}
              </span>
            </Td>
            <Td className="text-right px-4 font-normal whitespace-nowrap py-0.5">
              <div className="flex items-center inline-flex gap-x-2">
                <a
                  id={`edit_auth_method_link_${m.id}`}
                  href="#webhook_security"
                  className={action}
                  onClick={(e) => (e.preventDefault(), canWrite && onView(m))}
                >
                  {canWrite ? "View" : "Edit"}
                </a>
              </div>
              <div className="flex items-center inline-flex gap-x-2">
                <a
                  id={`delete_auth_method_link_${m.id}`}
                  href="#webhook_security"
                  className={action}
                  onClick={(e) => (e.preventDefault(), canWrite && onDelete(m))}
                >
                  Delete
                </a>
              </div>
            </Td>
          </Tr>
        );
      })}
    </Table>
  );
}
