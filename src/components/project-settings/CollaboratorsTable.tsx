import Button from "../Button";
import { Select } from "../Inputs";
import { EmptyState, Table, Td, Th, Tr } from "../Table";
import type { ProjectMember } from "../../mock-data/projects";
import { digestOptions } from "../../mock-data/project-settings";
import { findUser, fullName } from "../../mock-data/users";
import { capitalize } from "../../utils/format";

interface Props {
  members: ProjectMember[];
  currentUserId: string;
  canRemoveProjectUser: boolean;
  /** Whether the instance can send failure alerts at all. */
  canReceiveFailureAlerts?: boolean;
  onChange: (member: ProjectMember) => void;
  onRemove: (member: ProjectMember) => void;
  onAdd: () => void;
  canAdd: boolean;
}

/** settings.ex `remove_user_tooltip/5` (sandbox parent-admin rule omitted). */
function removeTooltip(member: ProjectMember, currentUserId: string, canRemove: boolean): string {
  if (!canRemove) return "You do not have permission to remove a user";
  if (member.userId === currentUserId) return "You cannot remove yourself";
  if (member.role === "owner") return "You cannot remove an owner";
  return "";
}

/**
 * Lightning's `DataTables.collaborators_table` (live/components/data_tables.ex):
 * Collaborator, Role, Failure Alert, Digest and a Remove Collaborator
 * button. Alert settings are only editable on your own row.
 */
export default function CollaboratorsTable({
  members,
  currentUserId,
  canRemoveProjectUser,
  canReceiveFailureAlerts = true,
  onChange,
  onRemove,
  onAdd,
  canAdd,
}: Props) {
  if (members.length === 0) {
    return (
      <EmptyState
        icon="hero-plus-circle"
        message="No collaborators found."
        buttonText="Add a collaborator"
        onClick={onAdd}
        disabled={!canAdd}
      />
    );
  }
  return (
    <Table
      id="collaborators-table"
      header={
        <Tr>
          <Th>Collaborator</Th>
          <Th>Role</Th>
          <Th>Failure Alert</Th>
          <Th>Digest</Th>
          <Th actions />
        </Tr>
      }
    >
      {members.map((m) => {
        const user = findUser(m.userId);
        const self = m.userId === currentUserId;
        const tooltip = removeTooltip(m, currentUserId, canRemoveProjectUser);
        return (
          <Tr key={m.userId} id={`project_user-${m.userId}`}>
            <Td>
              <div>{user ? fullName(user) : m.userId}</div>
              <div className="text-xs">{user?.email}</div>
              {self && <em className="text-xs text-gray-400">Well hello, you!</em>}
            </Td>
            <Td>{capitalize(m.role)}</Td>
            <Td>
              {!canReceiveFailureAlerts ? (
                "Unavailable"
              ) : self ? (
                <Select
                  id={`failure-alert-${m.userId}`}
                  aria-label="Failure Alert"
                  value={String(m.failureAlert)}
                  options={[
                    ["Disabled", "false"],
                    ["Enabled", "true"],
                  ]}
                  onChange={(e) => onChange({ ...m, failureAlert: e.target.value === "true" })}
                />
              ) : m.failureAlert ? (
                "Enabled"
              ) : (
                "Disabled"
              )}
            </Td>
            <Td>
              {self ? (
                <Select
                  id={`digest-${m.userId}`}
                  aria-label="Digest"
                  value={m.digest}
                  options={digestOptions.map((d) => [capitalize(d), d] as [string, string])}
                  onChange={(e) => onChange({ ...m, digest: e.target.value as ProjectMember["digest"] })}
                />
              ) : (
                capitalize(m.digest)
              )}
            </Td>
            <Td actions>
              <Button
                id={`remove_project_user_${m.userId}_button`}
                theme="secondary"
                size="lg"
                tooltip={tooltip || undefined}
                disabled={tooltip !== ""}
                onClick={() => onRemove(m)}
              >
                <span className="hero-minus-circle h-5 w-5" /> Remove Collaborator
              </Button>
            </Td>
          </Tr>
        );
      })}
    </Table>
  );
}
