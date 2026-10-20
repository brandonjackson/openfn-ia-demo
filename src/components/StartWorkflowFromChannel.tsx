import { useNavigate } from "react-router-dom";
import { Folder } from "lucide-react";
import MenuButton from "./MenuButton";
import { projects } from "../mock-data/projects";

interface Props {
  /** Service catalog ID of the event channel the workflow should start from. */
  channelId: string;
}

/**
 * "Create a workflow here" on an event channel: pick a project, then land in
 * the workflow editor with a new workflow triggered by this channel.
 */
export default function StartWorkflowFromChannel({ channelId }: Props) {
  const navigate = useNavigate();
  return (
    <MenuButton
      appearance="link"
      label="Create a workflow here"
      menuTitle="Start the workflow in…"
      items={projects.map((p) => ({ id: p.id, label: p.name, icon: Folder }))}
      onSelect={(projectId) =>
        navigate(`/workflow-editor/new?project=${projectId}&channel=${channelId}`)
      }
    />
  );
}
