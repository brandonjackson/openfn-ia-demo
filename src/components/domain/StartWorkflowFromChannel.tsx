import { Folder } from "lucide-react";
import MenuButton from "../primitives/MenuButton";

interface Props {
  /** The projects the workflow can be started in. */
  projects: { id: string; name: string }[];
  /** Starts the workflow in the picked project. */
  onSelect: (projectId: string) => void;
}

/**
 * "Create a workflow here" on an event channel: pick a project, then land in
 * the workflow editor with a new workflow triggered by this channel.
 */
export default function StartWorkflowFromChannel({ projects, onSelect }: Props) {
  return (
    <MenuButton
      appearance="link"
      label="Create a workflow here"
      menuTitle="Start the workflow in…"
      items={projects.map((p) => ({ id: p.id, label: p.name, icon: Folder }))}
      onSelect={onSelect}
    />
  );
}
