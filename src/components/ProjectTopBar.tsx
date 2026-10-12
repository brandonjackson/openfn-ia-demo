import type { Project } from "../mock-data/projects";
import ProjectSwitcher from "./ProjectSwitcher";
import BranchPicker from "./BranchPicker";

interface Props {
  project: Project;
  projects: { id: string; name: string }[];
  /** `MAIN_BRANCH` or a sandbox id. */
  branchId: string;
  onBranchChange: (id: string) => void;
}

/**
 * Bar across the top of every page inside a project, next to the logo:
 * `Project ⌄ / branch ⌄`, the way Railway shows project and environment.
 */
export default function ProjectTopBar({ project, projects, branchId, onBranchChange }: Props) {
  return (
    <div className="flex h-[60px] flex-shrink-0 items-center gap-1 border-b border-gray-200 bg-white px-6">
      <div className="min-w-0 max-w-[50%]">
        <ProjectSwitcher projects={projects} currentId={project.id} />
      </div>
      <span className="flex-shrink-0 text-lg font-light text-gray-300">/</span>
      <div className="min-w-0 max-w-[40%]">
        <BranchPicker
          projectId={project.id}
          environment={project.environment}
          sandboxes={project.sandboxes}
          selectedId={branchId}
          onSelect={onBranchChange}
        />
      </div>
    </div>
  );
}
