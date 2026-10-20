import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Plus } from "lucide-react";
import type { IANode } from "../ia-tree";
import type { ProjectsPageData } from "../page-data";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import { TextInput } from "../components/FormControls";
import ProjectCard from "../components/ProjectCard";
import CreateProjectFlow from "../components/CreateProjectFlow";

interface Props {
  node: IANode;
  ancestors: { node: IANode; path: string }[];
  currentPath: string;
  data: ProjectsPageData;
}

export default function ProjectsTemplate({ node, ancestors, data }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const needle = query.trim().toLowerCase();
  const filtered = data.projects.filter(
    (p) =>
      !needle ||
      p.name.toLowerCase().includes(needle) ||
      p.description.toLowerCase().includes(needle)
  );

  const handleCreateProject = () => {
    // Prototype flow: a new project routes the user through to Project A.
    setCreateOpen(false);
    navigate("/projects/project-a");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={{
          ancestors: ancestors.map((a) => ({ label: a.node.label, path: a.path })),
          current: node.label,
        }}
        title={node.label}
        description={node.description}
        actions={
          <>
            <TextInput
              type="search"
              placeholder="Search projects…"
              aria-label="Search projects"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-56"
            />
            <Button icon={Plus} onClick={() => setCreateOpen(true)}>
              New project
            </Button>
          </>
        }
      />

      <div className="space-y-3">
        <p className="text-xs text-gray-400">
          {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        </p>

        {filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderKanban}
            title={needle ? `No projects match "${query}"` : "No projects yet"}
            description={needle ? undefined : "Create a project to start building workflows."}
            action={
              needle ? undefined : (
                <Button icon={Plus} onClick={() => setCreateOpen(true)}>
                  New project
                </Button>
              )
            }
          />
        )}
      </div>

      <CreateProjectFlow
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}
