import { FlaskConical, GitBranch, Plus, Settings2 } from "lucide-react";
import type { ProjectSandbox } from "../mock-data/projects";
import DropdownMenu, { DropdownMenuDivider, DropdownMenuHeading, DropdownMenuItem } from "./DropdownMenu";

/** Id used for the project itself (its main branch) in the picker. */
export const MAIN_BRANCH = "main";

interface Props {
  projectId: string;
  /** The project's own environment, shown next to main. */
  environment: string;
  sandboxes: ProjectSandbox[];
  /** `MAIN_BRANCH` or a sandbox id. */
  selectedId: string;
  onSelect: (id: string) => void;
  defaultOpen?: boolean;
}

/**
 * Picks which branch of the project you're working in: the project itself
 * (main) or one of its sandboxes. Like Railway's environment picker, it
 * tints amber while you're in a sandbox so it's hard to forget.
 */
export default function BranchPicker({
  projectId,
  environment,
  sandboxes,
  selectedId,
  onSelect,
  defaultOpen,
}: Props) {
  const sandbox = sandboxes.find((s) => s.id === selectedId);
  const inSandbox = Boolean(sandbox);

  return (
    <DropdownMenu
      label="Switch branch"
      defaultOpen={defaultOpen}
      triggerClassName={inSandbox ? "bg-amber-50 text-amber-800 hover:bg-amber-100" : ""}
      trigger={
        <>
          {inSandbox ? (
            <FlaskConical size={14} className="flex-shrink-0" />
          ) : (
            <GitBranch size={14} className="flex-shrink-0 text-gray-400" />
          )}
          <span className="truncate" title={sandbox?.name}>
            {sandbox?.name ?? MAIN_BRANCH}
          </span>
        </>
      }
    >
      {(close) => {
        const choose = (id: string) => {
          onSelect(id);
          close();
        };
        return (
          <>
            <DropdownMenuItem
              label={MAIN_BRANCH}
              icon={GitBranch}
              meta={environment}
              selected={!inSandbox}
              onSelect={() => choose(MAIN_BRANCH)}
            />
            <DropdownMenuDivider />
            <DropdownMenuHeading>Sandboxes</DropdownMenuHeading>
            {sandboxes.length === 0 && (
              <p className="px-2 pb-1.5 text-xs text-gray-400">No sandboxes yet.</p>
            )}
            {sandboxes.map((s) => (
              <DropdownMenuItem
                key={s.id}
                label={s.name}
                icon={FlaskConical}
                meta={s.lastActivity}
                selected={s.id === selectedId}
                onSelect={() => choose(s.id)}
              />
            ))}
            <DropdownMenuDivider />
            <DropdownMenuItem
              label="New sandbox"
              icon={Plus}
              to={`/projects/${projectId}/sandboxes`}
              onSelect={close}
            />
            <DropdownMenuItem
              label="Manage sandboxes"
              icon={Settings2}
              to={`/projects/${projectId}/sandboxes`}
              onSelect={close}
            />
          </>
        );
      }}
    </DropdownMenu>
  );
}
