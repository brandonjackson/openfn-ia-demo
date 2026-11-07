import { UserMinus } from "lucide-react";
import { digestLabels, projectRoleLabels, type DigestFrequency, type ProjectRole } from "../../model/project-settings";
import { type Collaborator } from "../../model/projects";
import DataTable, { type DataTableColumn } from "../primitives/DataTable";
import Button from "../primitives/Button";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";
import { Select } from "../primitives/FormControls";

const roleOrder: ProjectRole[] = ["owner", "admin", "editor", "viewer"];
const digestOptions = (Object.keys(digestLabels) as DigestFrequency[]).map((d) => ({ value: d, label: digestLabels[d] }));
const alertOptions = [
  { value: "enabled", label: "Enabled" },
  { value: "disabled", label: "Disabled" },
];

interface Props {
  collaborators: Collaborator[];
  /** Changes someone's role. Each row's `assignableRoles` says whose you can change, and to what. */
  onChangeRole?: (id: string, role: ProjectRole) => void;
  /** Turns your own failure alerts on or off. Only your own row offers it. */
  onSetFailureAlert?: (id: string, enabled: boolean) => void;
  /** Sets how often you get a digest. Only your own row offers it. */
  onSetDigest?: (id: string, digest: DigestFrequency) => void;
  /** Asks to remove someone; the row's `removeBlockedReason` turns the button off with a reason. */
  onRemove?: (collaborator: Collaborator) => void;
}

/**
 * The people in a project: their role, which you can change where the row
 * allows it, and their failure alerts and digest, which only you can change
 * for yourself.
 */
export default function CollaboratorTable({ collaborators, onChangeRole, onSetFailureAlert, onSetDigest, onRemove }: Props) {
  const columns: DataTableColumn<Collaborator>[] = [
    {
      key: "collaborator",
      header: "Collaborator",
      render: (c) => (
        <Stack gap="none">
          <Text tone="strong">
            {c.firstName} {c.lastName}
          </Text>
          <Text tone="muted" size="xs">
            {c.email}
          </Text>
          {c.isSelf && (
            <Text tone="subtle" size="xs">
              Well hello, you!
            </Text>
          )}
        </Stack>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (c) =>
        onChangeRole && c.assignableRoles.length > 0 ? (
          <Select
            compact
            aria-label={`Role for ${c.firstName} ${c.lastName}`}
            value={c.role}
            onChange={(e) => onChangeRole(c.id, e.target.value as ProjectRole)}
            options={roleOrder
              .filter((r) => r === c.role || c.assignableRoles.includes(r))
              .map((r) => ({ value: r, label: projectRoleLabels[r] }))}
          />
        ) : (
          <Text>{projectRoleLabels[c.role]}</Text>
        ),
    },
    {
      key: "failure-alert",
      header: "Failure alert",
      render: (c) =>
        c.isSelf && onSetFailureAlert ? (
          <Select
            compact
            aria-label="Your failure alerts"
            value={c.failureAlert ? "enabled" : "disabled"}
            onChange={(e) => onSetFailureAlert(c.id, e.target.value === "enabled")}
            options={alertOptions}
          />
        ) : (
          <Text>{c.failureAlert ? "Enabled" : "Disabled"}</Text>
        ),
    },
    {
      key: "digest",
      header: "Digest",
      render: (c) =>
        c.isSelf && onSetDigest ? (
          <Select
            compact
            aria-label="Your digest"
            value={c.digest}
            onChange={(e) => onSetDigest(c.id, e.target.value as DigestFrequency)}
            options={digestOptions}
          />
        ) : (
          <Text>{digestLabels[c.digest]}</Text>
        ),
    },
  ];
  if (onRemove)
    columns.push({
      key: "actions",
      header: "",
      align: "right",
      render: (c) => (
        <Button
          variant="outline-danger"
          size="xs"
          icon={UserMinus}
          disabled={!!c.removeBlockedReason}
          title={c.removeBlockedReason}
          onClick={() => onRemove(c)}
        >
          Remove
        </Button>
      ),
    });

  return (
    <DataTable columns={columns} rows={collaborators} getRowKey={(c) => c.id} emptyMessage="No collaborators found." />
  );
}
