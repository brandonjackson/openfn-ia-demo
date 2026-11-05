import { useState } from "react";
import { FolderKanban, Plus } from "lucide-react";
import type { PageProps } from "../model/ia-tree";
import type { ProjectsPageData } from "../model/page-data";
import PageHeader from "../components/patterns/PageHeader";
import Breadcrumbs from "../components/domain/Breadcrumbs";
import Button from "../components/primitives/Button";
import EmptyState from "../components/primitives/EmptyState";
import { TextInput } from "../components/primitives/FormControls";
import ProjectCard from "../components/domain/ProjectCard";
import CreateProjectFlow, { type NewProjectInput } from "../components/domain/CreateProjectFlow";

export interface ProjectsPageProps extends PageProps<ProjectsPageData> {
  /** Creates a project from the form, and opens it. Rejects with the server's refusal, which the form shows. */
  onCreateProject: (project: NewProjectInput) => Promise<void>;
}

export default function ProjectsPage({ node, ancestors, data, onCreateProject }: ProjectsPageProps) {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const needle = query.trim().toLowerCase();
  const filtered = data.projects.filter(
    (p) =>
      !needle ||
      p.name.toLowerCase().includes(needle) ||
      p.description.toLowerCase().includes(needle)
  );

  const handleCreateProject = async (project: NewProjectInput) => {
    await onCreateProject(project);
    setCreateOpen(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
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
              compact
              className="w-56"
            />
            <Button icon={Plus} size="sm" onClick={() => setCreateOpen(true)}>
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
                <Button icon={Plus} size="sm" onClick={() => setCreateOpen(true)}>
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
