import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ProjectTopBar from "./ProjectTopBar";
import { MAIN_BRANCH } from "./BranchPicker";
import { projects } from "../mock-data/projects";
import { useCurrentProject } from "../hooks/useCurrentProject";

export default function Layout() {
  const project = useCurrentProject();
  // Prototype: remember the chosen branch per project for this visit.
  const [branches, setBranches] = useState<Record<string, string>>({});

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {project && (
          <ProjectTopBar
            project={project}
            projects={projects}
            branchId={branches[project.id] ?? MAIN_BRANCH}
            onBranchChange={(id) => setBranches((b) => ({ ...b, [project.id]: id }))}
          />
        )}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
