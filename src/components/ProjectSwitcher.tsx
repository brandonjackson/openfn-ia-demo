import { Folder, FolderKanban } from "lucide-react";
import DropdownMenu, { DropdownMenuDivider, DropdownMenuHeading, DropdownMenuItem } from "./DropdownMenu";

interface Props {
  projects: { id: string; name: string }[];
  currentId: string;
  defaultOpen?: boolean;
}

/**
 * Shows the project you're in and lets you jump to another one without
 * going back to the Projects list.
 */
export default function ProjectSwitcher({ projects, currentId, defaultOpen }: Props) {
  const current = projects.find((p) => p.id === currentId);

  return (
    <DropdownMenu
      label="Switch project"
      defaultOpen={defaultOpen}
      trigger={
        <span className="truncate" title={current?.name}>
          {current?.name ?? "Select a project"}
        </span>
      }
    >
      {(close) => (
        <>
          <DropdownMenuHeading>Projects</DropdownMenuHeading>
          {projects.map((p) => (
            <DropdownMenuItem
              key={p.id}
              label={p.name}
              icon={Folder}
              selected={p.id === currentId}
              to={`/projects/${p.id}`}
              onSelect={close}
            />
          ))}
          <DropdownMenuDivider />
          <DropdownMenuItem label="View all projects" icon={FolderKanban} to="/projects" onSelect={close} />
        </>
      )}
    </DropdownMenu>
  );
}
