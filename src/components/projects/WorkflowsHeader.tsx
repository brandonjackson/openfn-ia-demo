import Button from "../Button";
import CountTitle from "./CountTitle";
import SearchInput from "../SearchInput";

/**
 * Above the workflows metrics (DashboardComponents.workflows_header):
 * "Workflows (n)", the search box and "Create new workflow".
 */
export default function WorkflowsHeader({
  count,
  projectId,
  canCreate = true,
  searchTerm,
  onSearch,
}: {
  count: number;
  projectId: string;
  canCreate?: boolean;
  searchTerm: string;
  onSearch: (term: string) => void;
}) {
  return (
    <div className="flex justify-between items-center mb-6">
      <CountTitle title="Workflows" count={count} />
      <div className="flex gap-2 items-stretch">
        <SearchInput value={searchTerm} onChange={onSearch} className="w-96" />
        <Button
          id="new-workflow-button"
          theme="primary"
          className="whitespace-nowrap"
          to={`/projects/${projectId}/w/new`}
          disabled={!canCreate}
          tooltip={canCreate ? undefined : "You are not authorized to perform this action."}
        >
          Create new workflow
        </Button>
      </div>
    </div>
  );
}
