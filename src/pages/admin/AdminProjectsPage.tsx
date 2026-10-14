import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/Button";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import AdminProjectForm from "../../components/admin/AdminProjectForm";
import AdminProjectsTable from "../../components/admin/AdminProjectsTable";
import ProjectDeletionModal from "../../components/project-settings/ProjectDeletionModal";
import { purgeDeletedAfterDays } from "../../mock-data/admin";
import { findProject, projects } from "../../mock-data/projects";
import { users } from "../../mock-data/users";

/**
 * Inventory view `admin-projects` (ProjectLive.Index): the table at
 * /settings/projects, the form at /new and /:projectId, the delete modal at
 * /:projectId/delete.
 */
export default function AdminProjectsPage() {
  const { projectId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const back = () => navigate("/settings/projects");

  const isNew = pathname.endsWith("/settings/projects/new");
  const isDelete = pathname.endsWith("/delete");
  const project = projectId ? findProject(projectId) : undefined;
  const isForm = isNew || (!isDelete && !!project);
  const title = isNew ? "New Project" : isForm ? "Edit Project" : "Projects";

  return (
    <PageContent
      header={
        <Header title={title}>
          <Button to="/settings/projects/new">
            <span className="hero-plus h-4 w-4" />
            <span className="align-middle">New Project</span>
          </Button>
        </Header>
      }
    >
      <Centered>
        {isDelete && project && (
          <ProjectDeletionModal
            key={project.id}
            project={project}
            gracePeriodDays={purgeDeletedAfterDays}
            onCancel={back}
            onDelete={back}
          />
        )}
        {isForm ? (
          <AdminProjectForm key={project?.id ?? "new"} project={isNew ? undefined : project} users={users} onSave={back} />
        ) : (
          <AdminProjectsTable projects={projects} />
        )}
      </Centered>
    </PageContent>
  );
}
