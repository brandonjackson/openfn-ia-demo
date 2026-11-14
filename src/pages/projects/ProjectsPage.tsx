import { useState } from "react";
import { FolderKanban, Plus } from "lucide-react";
import type { PageProps } from "../../model/ia-tree";
import type { OtherProject, ProjectSummary } from "../../model/projects";
import ListPage from "../../components/patterns/ListPage";
import PageHeader from "../../components/patterns/PageHeader";
import Breadcrumbs from "../../components/domain/Breadcrumbs";
import Button from "../../components/primitives/Button";
import Stack from "../../components/primitives/Stack";
import Inline from "../../components/primitives/Inline";
import EmptyState from "../../components/primitives/EmptyState";
import SearchInput from "../../components/primitives/SearchInput";
import ProjectCard from "../../components/domain/ProjectCard";
import OtherProjectRow from "../../components/domain/OtherProjectRow";
import ListGroup from "../../components/primitives/ListGroup";
import CreateProjectFlow, { type NewProjectInput } from "../../components/domain/CreateProjectFlow";

/** What the Projects page shows. */
export interface ProjectsPageData {
  /** The projects you're a member of that aren't being deleted, each as its card: "Your projects". */
  projects: ProjectSummary[];
  /** The rest of the instance's projects, which you can ask to join: "Other projects". Absent, the section is left out. */
  otherProjects?: OtherProject[];
}

export interface ProjectsPageProps extends PageProps<ProjectsPageData> {
  /** Creates a project from the form, and opens it. Rejects with the server's refusal, which the form shows. */
  onCreateProject: (project: NewProjectInput) => Promise<void>;
  /** Makes a copy of one of your projects. Left out, its ⋮ menu has no Make a copy. */
  onCopyProject?: (id: string) => Promise<void>;
  /** Asks to join one of the other projects. Left out, they have no Request to join. */
  onRequestToJoin?: (id: string) => Promise<void>;
}

/**
 * Projects: yours, which open, with Make a copy and Settings in each ⋮ menu,
 * then the rest of the instance's, which don't open and offer Request to join.
 */
export default function ProjectsPage({ node, ancestors, data, onCreateProject, onCopyProject, onRequestToJoin }: ProjectsPageProps) {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [copying, setCopying] = useState(false);

  const needle = query.trim().toLowerCase();
  const matches = (p: { name: string; description: string }) =>
    !needle || p.name.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle);
  const filtered = data.projects.filter(matches);
  const others = (data.otherProjects ?? []).filter(matches);
  const any = data.projects.length + (data.otherProjects?.length ?? 0) > 0;

  /** Copies a project, once at a time; the wrapper says how it went. */
  const copy = async (id: string) => {
    if (copying || !onCopyProject) return;
    setCopying(true);
    try {
      await onCopyProject(id);
    } catch {
      // Refused: the wrapper said why.
    } finally {
      setCopying(false);
    }
  };

  const handleCreateProject = async (project: NewProjectInput) => {
    await onCreateProject(project);
    setCreateOpen(false);
  };

  return (
    <>
      <ListPage
        header={
          <PageHeader
            breadcrumbs={<Breadcrumbs ancestors={ancestors.map((a) => ({ label: a.node.label, path: a.path }))} current={node.label} />}
            title={node.label}
            description={node.description}
            actions={
              <Button icon={Plus} size="sm" onClick={() => setCreateOpen(true)}>
                New project
              </Button>
            }
          />
        }
        toolbar={
          any && (
            <Inline>
              <SearchInput
                placeholder="Search projects…"
                aria-label="Search projects"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                compact
              />
            </Inline>
          )
        }
        isEmpty={filtered.length + others.length === 0}
        empty={
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
        }
      >
        <Stack gap="xl">
          {filtered.length > 0 && (
            <ListGroup title="Your projects" count={filtered.length}>
              {filtered.map((project) => (
                <ProjectCard key={project.id} project={project} onCopy={onCopyProject && (() => void copy(project.id))} showSettings />
              ))}
            </ListGroup>
          )}
          {others.length > 0 && (
            <ListGroup title="Other projects" count={others.length} description="Projects on this instance you aren't in. Ask to join one to open it.">
              {others.map((project) => (
                <OtherProjectRow key={project.id} project={project} onRequestToJoin={onRequestToJoin && (() => onRequestToJoin(project.id))} />
              ))}
            </ListGroup>
          )}
        </Stack>
      </ListPage>

      <CreateProjectFlow open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreateProject} />
    </>
  );
}
