import Button from "../Button";
import TableTitle from "../TableTitle";
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
    <TableTitle title="Workflows" count={count} className="mb-6">
      <SearchInput value={searchTerm} onChange={onSearch} className="w-96" />
      <Button
        id="new-workflow-button"
        className="whitespace-nowrap"
        to={`/projects/${projectId}/w/new`}
        disabled={!canCreate}
        tooltip={canCreate ? undefined : "You are not authorized to perform this action."}
      >
        Create new workflow
      </Button>
    </TableTitle>
  );
}
