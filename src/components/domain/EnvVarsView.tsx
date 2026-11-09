import { useState } from "react";
import { Variable } from "lucide-react";
import type { Environment } from "../../model/credentials";
import { ENVIRONMENTS, environmentLabels } from "../../model/credentials";
import type { EnvVar, EnvVarDraft } from "../../model/env-vars";
import { listEnvironments } from "../../model/env-vars";
import Badge from "../primitives/Badge";
import Card from "../primitives/Card";
import ConfirmModal from "../primitives/ConfirmModal";
import EmptyState from "../primitives/EmptyState";
import ListHeader from "../primitives/ListHeader";
import ScrollPane from "../primitives/ScrollPane";
import SearchInput from "../primitives/SearchInput";
import SectionHeading from "../primitives/SectionHeading";
import SegmentedControl from "../primitives/SegmentedControl";
import Stack from "../primitives/Stack";
import EnvVarForm from "./EnvVarForm";
import EnvVarRow from "./EnvVarRow";

interface Props {
  /** The project's variables, by key. */
  variables: EnvVar[];
  /** Named in the description. */
  projectName?: string;
  /** Makes a variable. Left out where you can't add them. */
  onCreate?: (draft: EnvVarDraft) => Promise<void>;
  /** Changes one. Left out where you can't. */
  onUpdate?: (id: string, draft: EnvVarDraft) => Promise<void>;
  /** Deletes one. Left out where you can't. */
  onDelete?: (id: string) => Promise<void>;
  /** Start with a row open (useful for stories). */
  defaultExpandedId?: string;
}

type Filter = "all" | Environment;

/**
 * A project's environment variables, as the editor's explorer opens them
 * from the Workflow section: a form at the top that adds them a key and
 * value at a time (or a pasted `.env` at once), and the list under it,
 * searchable and narrowed to one environment, where each opens to edit in
 * place. Modelled on Railway's and Vercel's, not a text file to edit.
 */
export default function EnvVarsView({ variables, projectName, onCreate, onUpdate, onDelete, defaultExpandedId }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [deleting, setDeleting] = useState<EnvVar>();
  const [busy, setBusy] = useState(false);

  const q = query.trim().toLowerCase();
  const shown = variables.filter((v) => (filter === "all" || v.environments.includes(filter)) && (!q || v.key.toLowerCase().includes(q)));
  const filters = [
    { id: "all", label: "All", count: variables.length },
    ...ENVIRONMENTS.map((e) => ({ id: e, label: environmentLabels[e], count: variables.filter((v) => v.environments.includes(e)).length })),
  ];

  return (
    <ScrollPane>
      <Stack gap="lg">
        <SectionHeading
          title="Environment variables"
          description={`Values every workflow in ${projectName ?? "the project"} can use, set for each environment. A secret is hidden once saved.`}
          action={<Badge label="Project" icon={Variable} shape="tag" />}
        />

        {onCreate && (
          <Card title="Add variables">
            <EnvVarForm existing={variables} onCreate={onCreate} />
          </Card>
        )}

        <Card flush>
          {variables.length === 0 ? (
            <EmptyState
              icon={Variable}
              title="No environment variables yet"
              description={onCreate ? "Add a key and value above, or paste a .env file into a key." : "Editors add them here for every workflow in the project."}
            />
          ) : (
            <Stack divided>
              <ListHeader
                trailing={<SearchInput placeholder="Search keys" aria-label="Search keys" value={query} onChange={(e) => setQuery(e.target.value)} compact />}
              >
                <SegmentedControl label="Environment" variant="boxed" size="sm" options={filters} value={filter} onChange={(f) => setFilter(f as Filter)} />
              </ListHeader>
              {shown.map((v) => (
                <EnvVarRow
                  key={v.id}
                  variable={v}
                  existing={variables}
                  defaultExpanded={v.id === defaultExpandedId}
                  onUpdate={onUpdate && ((draft) => onUpdate(v.id, draft))}
                  onDelete={onDelete && (() => setDeleting(v))}
                />
              ))}
              {shown.length === 0 && <EmptyState title="No variables match" description="Try another key, or another environment." />}
            </Stack>
          )}
        </Card>
      </Stack>

      {onDelete && (
        <ConfirmModal
          open={deleting !== undefined}
          title={`Delete ${deleting?.key ?? ""}?`}
          confirmLabel="Delete variable"
          busy={busy}
          onClose={() => setDeleting(undefined)}
          onConfirm={() => {
            if (!deleting || busy) return;
            setBusy(true);
            void onDelete(deleting.id).finally(() => {
              setBusy(false);
              setDeleting(undefined);
            });
          }}
        >
          Workflows that read {deleting?.key} in {deleting ? listEnvironments(deleting.environments) : ""} will get nothing back once it's gone.
        </ConfirmModal>
      )}
    </ScrollPane>
  );
}
