import type { Project } from "../../mock-data/projects";

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
 * project, then the granted projects as removable blue chips.
 */
export default function ProjectsPicker({ id, type, projects, selectedIds, onChange }: Props) {
  const available = projects.filter((p) => !selectedIds.includes(p.id));
  const selected = selectedIds.map((pid) => projects.find((p) => p.id === pid)).filter((p): p is Project => !!p);
  const prompt =
    type === "credential" ? "Grant projects access to this credential" : "Grant projects access to this OAuth client";
  const selectId = type === "credential" ? `project-credentials-list-${id}` : `project-oauth-clients-list-${id}`;

  return (
    <div className="col-span-3">
      <div>
        <div className="mt-1 pb-3">
          <select
            id={selectId}
            value=""
            onChange={(e) => e.target.value && onChange([...selectedIds, e.target.value])}
            className="block w-full rounded-lg border border-secondary-300 bg-white sm:text-sm shadow-xs focus:border-primary-300 focus:ring focus:ring-primary-200/50 disabled:cursor-not-allowed"
          >
            <option value="">{prompt}</option>
            {available.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-auto max-h-32">
          {selected.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-4 mr-1 py-2 mb-2 text-gray-600"
            >
              {p.name}
              <button
                type="button"
                onClick={() => onChange(selectedIds.filter((x) => x !== p.id))}
                className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20"
              >
                <span className="sr-only">Remove</span>
                <span className="hero-x-mark-solid w-4 h-4 block" />
                <span className="absolute -inset-1" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
