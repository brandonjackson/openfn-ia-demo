import type { Project } from "../../mock-data/projects";
import { Select } from "../Inputs";
import Pill from "../Pill";

interface Props {
  id: string;
  type: "credential" | "oauth_client";
  /** Every project the user can grant; the select lists those not yet selected. */
  projects: Project[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

/**
 * Lightning's `Components.Credentials.projects_picker`: a select that adds a
 * project, then the granted projects as removable chips.
 */
export default function ProjectsPicker({ id, type, projects, selectedIds, onChange }: Props) {
  const available = projects.filter((p) => !selectedIds.includes(p.id));
  const selected = selectedIds.map((pid) => projects.find((p) => p.id === pid)).filter((p): p is Project => !!p);
  const prompt =
    type === "credential" ? "Grant projects access to this credential" : "Grant projects access to this OAuth client";
  const selectId = type === "credential" ? `project-credentials-list-${id}` : `project-oauth-clients-list-${id}`;

  return (
    <div className="space-y-3">
      <Select
        id={selectId}
        value=""
        prompt={prompt}
        options={available.map((p) => ({ label: p.name, value: p.id }))}
        onChange={(e) => e.target.value && onChange([...selectedIds, e.target.value])}
      />
      {selected.length > 0 && (
        <div className="flex max-h-32 flex-wrap gap-1.5 overflow-auto">
          {selected.map((p) => (
            <Pill
              key={p.id}
              color="blue"
              removeLabel={`Remove ${p.name}`}
              onRemove={() => onChange(selectedIds.filter((x) => x !== p.id))}
            >
              {p.name}
            </Pill>
          ))}
        </div>
      )}
    </div>
  );
}
