import { useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import ProjectBreadcrumbs from "../../components/shell/ProjectBreadcrumbs";
import TableTitle from "../../components/TableTitle";
import { useToast } from "../../components/Toast";
import DeleteSandboxModal from "../../components/projects/sandboxes/DeleteSandboxModal";
import SandboxFormModal from "../../components/projects/sandboxes/SandboxFormModal";
import WorkspaceList from "../../components/projects/sandboxes/WorkspaceList";
import { findProject, roleIn } from "../../mock-data/projects";
import { findSandboxRow, rootOf, sandboxRowsUnder, type SandboxRow } from "../../mock-data/sandboxes";
import { currentUser } from "../../mock-data/users";

/**
 * Inventory view `sandboxes-index` (SandboxLive.Index): the workspace tree
 * with Create / Edit (route-driven modals at /new and /:sandboxId/edit),
 * Delete (confirm modal) and Restore. Merge is not built: its modal needs
 * Lightning's diff and conflict checks, so the button does nothing here.
 */
export default function SandboxesIndexPage() {
  const { projectId, sandboxId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const project = findProject(projectId);
  const [deleting, setDeleting] = useState<SandboxRow | null>(null);
  const [deletedAt, setDeletedAt] = useState<Record<string, string>>({});
  const [restoredIds, setRestoredIds] = useState<string[]>([]);
  const toast = useToast();

  if (!project) return <Navigate to="/projects" replace />;

  const root = rootOf(project.id)!;
  const rootRow = findSandboxRow(root.id)!;
  const role = roleIn(project, currentUser.id);
  const canCreate = role === "owner" || role === "admin";
  const disabledReason = canCreate ? undefined : "You are not authorized to create sandboxes in this workspace";
  const sandboxes = sandboxRowsUnder(root.id).map((s) => {
    if (restoredIds.includes(s.id)) return { ...s, scheduledDeletion: null };
    if (deletedAt[s.id]) return { ...s, scheduledDeletion: deletedAt[s.id] };
    return s;
  });
  const back = `/projects/${project.id}/sandboxes`;
  const creating = pathname.endsWith("/sandboxes/new");
  const editing = sandboxId ? findSandboxRow(sandboxId) : undefined;
  const parentOf = (row: SandboxRow) => findProject(row.parentId ?? undefined);

  return (
    <PageContent
      header={<Header breadcrumbs={<ProjectBreadcrumbs project={project} current="Sandboxes" />} />}
    >
      <Centered>
        <TableTitle title="Sandboxes" className="mb-6">
          <Button
            id="create-sandbox-button"
            size="lg"
            disabled={!canCreate}
            tooltip={disabledReason}
            onClick={() => navigate(`${back}/new`)}
          >
            Create Sandbox
          </Button>
        </TableTitle>

        <WorkspaceList
          root={rootRow}
          sandboxes={sandboxes}
          currentProjectId={project.id}
          canCreate={canCreate}
          disabledReason={disabledReason}
          onEdit={(s) => navigate(`/projects/${s.parentId}/sandboxes/${s.id}/edit`)}
          onDelete={(s) => setDeleting(s)}
          onRestore={(s) => {
            setRestoredIds((ids) => [...ids, s.id]);
            setDeletedAt((m) => {
              const next = { ...m };
              delete next[s.id];
              return next;
            });
            toast(`Cancelled deletion of sandbox ${s.name}.`);
          }}
        />

        {deleting && (
          <DeleteSandboxModal
            sandboxName={deleting.name}
            descendantCount={sandboxRowsUnder(deleting.id).length}
            isCurrent={deleting.id === project.id}
            rootName={root.name}
            onClose={() => setDeleting(null)}
            onConfirm={() => {
              // Scheduled for deletion at the end of the grace period.
              const at = new Date(Date.now() + 7 * 86_400_000).toISOString();
              setDeletedAt((m) => ({ ...m, [deleting.id]: at }));
              setRestoredIds((ids) => ids.filter((id) => id !== deleting.id));
              setDeleting(null);
              toast(`Sandbox ${deleting.name} scheduled for deletion.`);
            }}
          />
        )}

        {creating && (
          <SandboxFormModal
            mode="new"
            parentName={project.name}
            parentIsSandbox={project.parentId !== null}
            existingNames={sandboxes.filter((s) => s.parentId === project.id).map((s) => s.name)}
            onClose={() => navigate(back)}
          />
        )}

        {editing && (
          <SandboxFormModal
            key={editing.id}
            mode="edit"
            parentName={parentOf(editing)?.name ?? root.name}
            initialName={editing.name}
            initialColor={editing.color}
            existingNames={sandboxes.filter((s) => s.parentId === editing.parentId).map((s) => s.name)}
            onClose={() => navigate(back)}
          />
        )}
      </Centered>
    </PageContent>
  );
}
