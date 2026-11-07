import { useState } from "react";
import { MinusCircle, PlusCircle } from "lucide-react";
import { addableRoles, isValidEmail, projectRoleLabels, type ProjectRole } from "../../model/project-settings";
import { type CollaboratorDraft } from "../../model/projects";
import Modal from "../primitives/Modal";
import Button from "../primitives/Button";
import IconButton from "../primitives/IconButton";
import Stack from "../primitives/Stack";
import Inline from "../primitives/Inline";
import Text from "../primitives/Text";
import { Select, TextInput } from "../primitives/FormControls";

const roleOptions = addableRoles.map((r) => ({ value: r, label: projectRoleLabels[r] }));

interface Row {
  email: string;
  role: ProjectRole | "";
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Everyone already in the project, so they aren't added twice. */
  existingEmails: string[];
  /** Adds the collaborators. Resolves once it's done; the modal closes itself. */
  onAdd: (drafts: CollaboratorDraft[]) => Promise<void>;
}

/**
 * Adds people to a project by email, each with a role. People who don't have
 * an OpenFn account yet are invited next, by whoever handles `onAdd`.
 */
export default function AddCollaboratorsModal({ open, ...rest }: Props) {
  if (!open) return null;
  return <AddForm {...rest} />;
}

function emailError(row: Row, rows: Row[], existing: string[]): string | undefined {
  const email = row.email.trim().toLowerCase();
  if (!email) return undefined;
  if (!isValidEmail(email)) return "Email address not valid.";
  if (existing.includes(email)) return "This account is already part of this project";
  if (rows.filter((r) => r.email.trim().toLowerCase() === email).length > 1) return "This email is listed twice";
  return undefined;
}

function AddForm({ onClose, existingEmails, onAdd }: Omit<Props, "open">) {
  const [rows, setRows] = useState<Row[]>([{ email: "", role: "" }]);
  const [saving, setSaving] = useState(false);
  const existing = existingEmails.map((e) => e.toLowerCase());
  const errors = rows.map((r) => emailError(r, rows, existing));
  const valid = rows.every((r, i) => r.email.trim() && r.role && !errors[i]);

  const update = (i: number, change: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...change } : r)));
  const submit = async () => {
    setSaving(true);
    await onAdd(rows.map((r) => ({ email: r.email.trim().toLowerCase(), role: r.role as ProjectRole })));
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      open
      title="Add new collaborator(s)"
      onClose={onClose}
      widthClass="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid || saving} onClick={submit}>
            {rows.length > 1 ? "Save collaborators" : "Save collaborator"}
          </Button>
        </>
      }
    >
      <Stack gap="md">
        <Text tone="muted" size="xs" block>
          Enter the email address and role of new collaborator(s) to invite them to this project
        </Text>
        {rows.map((row, i) => (
          <Stack key={i} gap="xs">
            <Inline gap="sm">
              <Inline grow>
                <TextInput
                  type="email"
                  aria-label={`Email ${i + 1}`}
                  placeholder="email@example.com"
                  autoFocus={i === rows.length - 1}
                  value={row.email}
                  onChange={(e) => update(i, { email: e.target.value })}
                />
              </Inline>
              <Select
                aria-label={`Role ${i + 1}`}
                placeholder="Select role"
                options={roleOptions}
                value={row.role}
                onChange={(e) => update(i, { role: e.target.value as ProjectRole })}
              />
              {rows.length > 1 && (
                <IconButton
                  icon={MinusCircle}
                  label="Remove this row"
                  onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                />
              )}
            </Inline>
            {errors[i] && (
              <Text tone="danger" size="xs">
                {errors[i]}
              </Text>
            )}
          </Stack>
        ))}
        <Inline>
          <Button variant="secondary" size="sm" icon={PlusCircle} onClick={() => setRows((rs) => [...rs, { email: "", role: "" }])}>
            Add another collaborator
          </Button>
        </Inline>
      </Stack>
    </Modal>
  );
}
