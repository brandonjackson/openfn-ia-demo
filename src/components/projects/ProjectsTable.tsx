import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { ProjectOverview } from "../../mock-data/dashboard-stats";
import { EmptyState, Table, Td, Th, Tr } from "../Table";
import CountTitle from "./CountTitle";
import RelativeTime from "./RelativeTime";
import TableAction from "../TableAction";
import TextLink from "../TextLink";
import { compareBy, useSort } from "./useSort";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * The projects dashboard table (DashboardLive.Components.user_projects_table):
 * "Projects (n)" with the create button, then Name / Role / Workflows /
 * Collaborators / Last Updated rows. Name and Last Updated sort. A row opens
 * the project's workflows. With no projects it's the dashed empty state.
 */
export default function ProjectsTable({
  projects,
  createButton,
  onCreate,
}: {
  projects: ProjectOverview[];
  /** The "Create project" button, top right. */
  createButton?: ReactNode;
  /** Empty-state click. */
  onCreate?: () => void;
}) {
  const navigate = useNavigate();
  const { sortKey, direction, thProps } = useSort<"name" | "last_updated_at">("name");

  if (projects.length === 0) {
    return (
      <EmptyState
        icon="hero-plus-circle"
        message="No projects found."
        buttonText="Create a new one."
        onClick={onCreate}
      />
    );
  }

  const rows = [...projects].sort(
    compareBy((p) => (sortKey === "name" ? p.name : p.lastUpdatedAt), direction)
  );

  return (
    <>
      <div className="mt-5 flex justify-between mb-3">
        <CountTitle title="Projects" count={projects.length} />
        <div>{createButton}</div>
      </div>
      <div>
        <Table
          id="projects-table"
          header={
            <Tr>
              <Th {...thProps("name")}>Name</Th>
              <Th>Role</Th>
              <Th>Workflows</Th>
              <Th>Collaborators</Th>
              <Th {...thProps("last_updated_at")}>Last Updated</Th>
              <Th />
            </Tr>
          }
        >
          {rows.map((project) => (
            <Tr
              key={project.id}
              id={`projects-table-row-${project.id}`}
              className="hover:bg-gray-100 transition-colors duration-200"
              onClick={() => navigate(`/projects/${project.id}/w`)}
            >
              <Td>{project.name}</Td>
              <Td className="wrap-break-word max-w-[25rem]">{capitalize(project.role)}</Td>
              <Td className="wrap-break-word max-w-[10rem]">{project.workflowsCount}</Td>
              <Td className="wrap-break-word max-w-[5rem]">
                <TextLink
                  to={`/projects/${project.id}/settings#collaboration`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {project.collaboratorsCount}
                </TextLink>
              </Td>
              <Td>{project.lastUpdatedAt ? <RelativeTime datetime={project.lastUpdatedAt} /> : "N/A"}</Td>
              <Td className="text-right">
                <TableAction to={`/projects/${project.id}/history`}>History</TableAction>
              </Td>
            </Tr>
          ))}
        </Table>
      </div>
    </>
  );
}
