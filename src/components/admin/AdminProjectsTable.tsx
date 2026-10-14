import type { Project } from "../../mock-data/projects";
import { projectOwnerName, projectScheduledDeletions } from "../../mock-data/admin";
import SearchInput from "../SearchInput";
import ButtonMenu from "../ButtonMenu";
import { MenuItem } from "../Menu";
import { Table, Td, Th, Tr } from "../Table";
import { useTableSort, type SortValue } from "../useTableSort";
import { formatShortDateTime } from "../../utils/format";

type SortKey = "name" | "inserted_at" | "description" | "owner" | "scheduled_deletion";

const scheduled = (p: Project) => projectScheduledDeletions[p.id] ?? null;

const sortMap: Record<SortKey, (p: Project) => SortValue> = {
  name: (p) => p.name,
  inserted_at: (p) => p.insertedAt,
  description: (p) => p.description,
  owner: (p) => projectOwnerName(p),
  scheduled_deletion: (p) => scheduled(p),
};

const searchFields: ((p: Project) => string)[] = [(p) => p.name, (p) => p.description, (p) => projectOwnerName(p)];

/**
 * The superuser projects table (project_live/index.html.heex): every project
 * in the instance, filterable and sortable, with Edit / Delete (or Cancel
 * deletion / Delete now) in each row's Actions menu.
 */
export default function AdminProjectsTable({
  projects,
  onCancelDeletion,
}: {
  projects: Project[];
  onCancelDeletion?: (project: Project) => void;
}) {
  const { rows, filter, setFilter, thProps } = useTableSort({
    rows: projects,
    initialKey: "name",
    sortMap,
    searchFields,
    nulls: "last",
  });

  return (
    <>
      <SearchInput value={filter} onChange={setFilter} placeholder="Filter projects..." className="mb-4 max-w-sm" />
      <Table
        id="projects"
        header={
          <Tr>
            <Th {...thProps("name")}>Name</Th>
            <Th {...thProps("inserted_at")}>Created At</Th>
            <Th {...thProps("description")}>Description</Th>
            <Th {...thProps("owner")}>Owner</Th>
            <Th {...thProps("scheduled_deletion")}>Scheduled Deletion</Th>
            <Th actions />
          </Tr>
        }
      >
        {rows.map((project) => {
          const owner = projectOwnerName(project);
          const deletion = scheduled(project);
          return (
            <Tr key={project.id} id={`project-row-${project.id}`}>
              <Td className="max-w-80">{project.name}</Td>
              <Td>{formatShortDateTime(project.insertedAt)}</Td>
              <Td className="max-w-80">{project.description}</Td>
              <Td className="max-w-64 wrap-break-word">{owner === "" ? "No owner" : owner}</Td>
              <Td>{deletion && formatShortDateTime(deletion)}</Td>
              <Td actions className="py-0.5">
                <ButtonMenu label="Actions">
                  <MenuItem to={`/settings/projects/${project.id}`}>Edit</MenuItem>
                  {deletion && <MenuItem onClick={() => onCancelDeletion?.(project)}>Cancel deletion</MenuItem>}
                  <MenuItem to={`/settings/projects/${project.id}/delete`}>{deletion ? "Delete now" : "Delete"}</MenuItem>
                </ButtonMenu>
              </Td>
            </Tr>
          );
        })}
      </Table>
    </>
  );
}
