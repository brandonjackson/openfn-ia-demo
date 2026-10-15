import { Select } from "../Inputs";
import type { ProjectRole } from "../../types/projects";
import { collaboratorRoles } from "../../constants";
import { capitalize } from "../../utils/format";

/** The role options ("Admin", "Editor", …). */
const roleOptions = collaboratorRoles.map((r) => [capitalize(r), r] as [string, string]);

/** The "Select Role" dropdown on each row of the add and invite collaborator modals. */
export default function RoleSelect({ value, onChange }: { value: ProjectRole | ""; onChange: (role: ProjectRole) => void }) {
  return (
    <Select
      aria-label="Role"
      prompt="Select Role"
      required
      options={roleOptions}
      value={value}
      onChange={(e) => onChange(e.target.value as ProjectRole)}
    />
  );
}
