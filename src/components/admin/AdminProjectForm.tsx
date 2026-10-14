import { useState } from "react";
import { Link } from "react-router-dom";
import type { Project, ProjectRole } from "../../mock-data/projects";
import { fullName, type User } from "../../mock-data/users";
import { urlSafeName } from "../../utils/urlSafeName";
import { cn } from "../../utils/cn";
import FilterInput from "../FilterInput";
import { TextInput } from "../Inputs";
import NameBadge from "../NameBadge";
import { Table, Td, Th, Tr } from "../Table";
import { useTableSort, type SortValue } from "./tableSort";

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

const radioClass = "h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600";

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
    <Th className={cn(center && "text-center!")} {...sort.thProps(key)}>
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
        <div className="w-3/6">
          <TextInput id="project_raw_name" label="Name" value={rawName} onChange={(e) => setRawName(e.target.value)} />
          <div className="mt-2 text-sm text-gray-600">
            <NameBadge name={name}>Note that this project will be named:</NameBadge>
          </div>
        </div>
        <div className="sm:flex sm:items-center mt-8 mb-2">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-600">Manage project users</h1>
          </div>
        </div>

        {owners > 1 && (
          <div className="border-red-400 bg-red-50 p-4">
            <div className="flex">
              <div className="shrink-0">
                <span className="hero-exclamation-triangle h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">A project can have only one owner.</p>
              </div>
            </div>
          </div>
        )}

        <FilterInput value={sort.filter} onChange={sort.setFilter} placeholder="Filter users..." />

        <div className="mt-2 flow-root">
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
                  <Td key={r || "no_access"} className="text-center">
                    <input
                      type="radio"
                      name={`project_users[${user.id}][role]`}
                      id={`project_users_${user.id}_role_${r || "no_access"}`}
                      className={radioClass}
                      checked={role === r}
                      onChange={() => setRoles((prev) => ({ ...prev, [user.id]: r }))}
                    />
                  </Td>
                ))}
              </Tr>
            ))}
          </Table>
        </div>
        <div className="mt-4">
          <span>
            <Link
              to="/settings/projects"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-xs text-sm font-medium rounded-md text-white bg-secondary-700 hover:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
            >
              Cancel
            </Link>
          </span>
          <div className="inline-block ml-1">
            <button
              type="submit"
              disabled={!valid}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-xs text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 enabled:bg-primary-600 enabled:hover:bg-primary-700 disabled:bg-primary-300"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
