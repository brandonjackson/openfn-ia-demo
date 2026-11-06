import { useId, useState } from "react";
import { errorMessageOf, fieldErrorOf, FormError } from "../../model/form-error";
import type { AdminProject, AdminProjectDraft, AdminUser } from "../../model/page-data";
import type { ProjectRole } from "../../model/project-settings";
import { fullName, projectOwnerError, projectRoleLabels, projectRoles, projectSlug } from "../../model/admin";
import Button from "../primitives/Button";
import Callout from "../primitives/Callout";
import DataTable from "../primitives/DataTable";
import type { DataTableColumn } from "../primitives/DataTable";
import FormField from "../primitives/FormField";
import { Select, TextArea, TextInput } from "../primitives/FormControls";
import Modal from "../primitives/Modal";
import SearchInput from "../primitives/SearchInput";
import SectionHeading from "../primitives/SectionHeading";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  /** The project to edit. Without one, the form creates a new project. */
  project?: AdminProject;
  /** Everyone on the instance, any of whom can be given a role. */
  users: AdminUser[];
  /** Saves the form; the modal closes once it resolves. */
  onSave: (draft: AdminProjectDraft) => Promise<void>;
  onClose: () => void;
}

const NO_ACCESS = "No access";
const roleOptions = [NO_ACCESS, ...projectRoles.map((r) => projectRoleLabels[r])];

/**
 * A superuser creates or edits a project: its name (a new project's id is
 * made from it, which the form shows), a description, and who's in it, with a role for each
 * person on the instance. Every project has exactly one owner, and the form
 * won't save until it does. Mount it when it should show.
 */
export default function ProjectFormModal({ project, users, onSave, onClose }: Props) {
  const id = useId();
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [roles, setRoles] = useState<Record<string, ProjectRole | undefined>>(() =>
    Object.fromEntries((project?.members ?? []).map((m) => [m.userId, m.role]))
  );
  const [filter, setFilter] = useState("");
  const [saving, setSaving] = useState(false);
  // A save the server refused: shown above the form, which stays open.
  const [error, setError] = useState<unknown>(null);

  const members = Object.entries(roles).flatMap(([userId, role]) => (role ? [{ userId, role }] : []));
  const ownerError = projectOwnerError(members);
  const slug = projectSlug(name);
  const search = filter.trim().toLowerCase();
  const shown = users.filter((u) => !search || `${fullName(u)} ${u.email}`.toLowerCase().includes(search));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({ name: slug, description: description.trim(), members });
      onClose();
    } catch (refused) {
      setError(refused);
    } finally {
      setSaving(false);
    }
  };

  const columns: DataTableColumn<AdminUser>[] = [
    {
      key: "name",
      header: "Name",
      render: (u) => (
        <Stack gap="none">
          <Text tone={roles[u.id] ? "strong" : "muted"}>{fullName(u)}</Text>
          <Text tone="subtle" size="xs">
            {u.email}
          </Text>
        </Stack>
      ),
    },
    {
      key: "role",
      header: "Role",
      align: "right",
      render: (u) => {
        const role = roles[u.id];
        return (
          <Select
            aria-label={`${fullName(u)}'s role`}
            options={roleOptions}
            value={role ? projectRoleLabels[role] : NO_ACCESS}
            onChange={(e) =>
              setRoles((r) => ({ ...r, [u.id]: projectRoles.find((p) => projectRoleLabels[p] === e.target.value) }))
            }
          />
        );
      },
    },
  ];

  return (
    <Modal
      open
      title={project ? `Edit ${project.name}` : "New project"}
      onClose={onClose}
      widthClass="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!slug || !!ownerError || saving}>
            {project ? "Save" : "Create project"}
          </Button>
        </>
      }
    >
      <Stack gap="lg">
        {error !== null && (
          <Callout variant="danger" title="The project wasn't saved">
            {saveErrorOf(error)}
          </Callout>
        )}
        <Stack gap="md">
          <FormField
            label="Name"
            htmlFor={`${id}-name`}
            hint={project ? undefined : slug ? `Its id will be ${slug}.` : "Its id is made from the name, in lower case with dashes."}
          >
            <TextInput id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="Description" htmlFor={`${id}-description`}>
            <TextArea
              id={`${id}-description`}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>
        </Stack>
        <Stack gap="sm">
          <SectionHeading
            variant="label"
            title="Members"
            description="Give each person a role in this project. Exactly one of them is its owner."
          />
          {ownerError && <Callout variant="danger" title={ownerError} />}
          <SearchInput compact placeholder="Filter users" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <DataTable columns={columns} rows={shown} getRowKey={(u) => u.id} emptyMessage="No users match." />
        </Stack>
      </Stack>
    </Modal>
  );
}

/** A refused save in the form's words. */
function saveErrorOf(error: unknown): string {
  const name = fieldErrorOf(error, "name");
  if (name) return `The name ${name}.`;
  const members = error instanceof FormError && Object.keys(error.fieldErrors).some((k) => k.startsWith("members") || k === "role");
  if (members) return "Every member needs an account, and the project needs exactly one owner. The owner can't be changed once the project exists.";
  return errorMessageOf(error);
}
