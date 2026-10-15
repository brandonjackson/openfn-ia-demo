import { useState } from "react";
import type { Project, ProjectRole } from "../../types/projects";
import { fullName, urlSafeName } from "../../utils/format";
import type { User } from "../../types/users";
import { cn } from "../../utils/cn";
import SearchInput from "../SearchInput";
import Alert from "../Alert";
import Button from "../Button";
import Heading from "../Heading";
import { Radio } from "../Inputs";
import NameField from "../NameField";
import { Table, Td, Th, Tr } from "../Table";
import { useTableSort, type SortValue } from "../useTableSort";

type Role = ProjectRole | "";
const ROLES: ProjectRole[] = ["owner", "admin", "editor", "viewer"];

interface Row {
  user: User;
  role: Role;
}

type SortKey = "name" | "email" | "no_access" | ProjectRole;

const sortMap: Record<SortKey, (r: Row) => SortValue> = {
  name: (r) => fullName(r.user),
  email: (r) => r.user.email,
  no_access: (r) => r.role === "",
  owner: (r) => r.role === "owner",
  admin: (r) => r.role === "admin",
  editor: (r) => r.role === "editor",
  viewer: (r) => r.role === "viewer",
};

const searchFields: ((r: Row) => string)[] = [(r) => fullName(r.user), (r) => r.user.email];

interface Props {
  /** The project being edited; omit for /settings/projects/new. */
  project?: Project;
  users: User[];
  onSave?: (name: string, roles: Record<string, Role>) => void;
}

/**
 * The superuser project form (project_live/form_component.html.heex): a
 * name (with the slug it will get) and a role radio grid for every user in
 * the instance. Save needs a name and exactly one owner.
 */
export default function AdminProjectForm({ project, users, onSave }: Props) {
  const [rawName, setRawName] = useState(project?.name ?? "");
  const [roles, setRoles] = useState<Record<string, Role>>(() =>
    Object.fromEntries(users.map((u) => [u.id, project?.members.find((m) => m.userId === u.id)?.role ?? ""]))
  );
  const rows: Row[] = users.map((user) => ({ user, role: roles[user.id] }));
  const sort = useTableSort({ rows, initialKey: "name", sortMap, searchFields });

  const name = urlSafeName(rawName);
  const owners = Object.values(roles).filter((r) => r === "owner").length;
  const valid = name !== "" && owners === 1;

  const th = (key: SortKey, label: string, center = true) => (
    <Th align={center ? "center" : "left"} {...sort.thProps(key)}>
      {label}
    </Th>
  );

  return (
    <div id={`project-form-${project?.id ?? "new"}`}>
      <form
        id="project-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onSave?.(name, roles);
        }}
      >
        <NameField
          id="project_raw_name"
          value={rawName}
          onChange={setRawName}
          badgeLabel="Note that this project will be named:"
          fieldClassName="w-1/2"
        />
        <Heading as="h2" className="mb-2 mt-8">
          Manage project users
        </Heading>

        {owners > 1 && <Alert type="danger">A project can have only one owner.</Alert>}

        <SearchInput value={sort.filter} onChange={sort.setFilter} placeholder="Filter users..." className="mb-4 max-w-sm" />

        <Table
          id="project_users_table"
          header={
            <Tr>
              {th("name", "NAME", false)}
              {th("email", "EMAIL", false)}
              {th("no_access", "NO ACCESS")}
              {th("owner", "OWNER")}
              {th("admin", "ADMIN")}
              {th("editor", "EDITOR")}
              {th("viewer", "VIEWER")}
            </Tr>
          }
        >
          {sort.rows.map(({ user, role }) => (
            <Tr key={user.id} className={cn(role === "" && "text-gray-500 opacity-60")}>
              <Td>{fullName(user)}</Td>
              <Td>{user.email}</Td>
              {(["", ...ROLES] as Role[]).map((r) => (
                <Td key={r || "no_access"} align="center">
                  <span className="inline-flex justify-center">
                    <Radio
                      name={`project_users[${user.id}][role]`}
                      id={`project_users_${user.id}_role_${r || "no_access"}`}
                      label={<span className="sr-only">{`${fullName(user)}: ${r || "no access"}`}</span>}
                      checked={role === r}
                      onChange={() => setRoles((prev) => ({ ...prev, [user.id]: r }))}
                    />
                  </span>
                </Td>
              ))}
            </Tr>
          ))}
        </Table>
        <div className="mt-4 flex gap-1">
          <Button theme="secondary" to="/settings/projects">
            Cancel
          </Button>
          <Button type="submit" disabled={!valid}>
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
