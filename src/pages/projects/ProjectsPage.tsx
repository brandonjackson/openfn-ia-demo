import { useState } from "react";
import { FolderKanban, Plus } from "lucide-react";
import type { PageProps } from "../../model/ia-tree";
import type { ProjectSummary } from "../../model/projects";
import PageHeader from "../../components/patterns/PageHeader";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import Button from "../../components/primitives/Button";
import Stack from "../../components/primitives/Stack";
import Text from "../../components/primitives/Text";
import EmptyState from "../../components/primitives/EmptyState";
import SearchInput from "../../components/primitives/SearchInput";
import ProjectCard from "../../components/domain/ProjectCard";
import CreateProjectFlow, { type NewProjectInput } from "../../components/domain/CreateProjectFlow";

/** What the Projects page shows. */
export interface ProjectsPageData {
  /** The projects you're a member of that aren't being deleted, each as its card. */
  projects: ProjectSummary[];
}

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
    <Stack gap="xl">
      <PageHeader
        breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
        title={node.label}
        description={node.description}
        actions={
          <>
            <SearchInput
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

      <Stack gap="md">
        <Text size="xs" tone="muted" block role="status">
          {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        </Text>

        {filtered.length > 0 ? (
          <Stack gap="sm">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </Stack>
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
      </Stack>

      <CreateProjectFlow
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateProject}
      />
    </Stack>
  );
}
