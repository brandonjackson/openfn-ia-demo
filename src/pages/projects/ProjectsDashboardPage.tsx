import { useState } from "react";
import Button from "../../components/Button";
import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import CreateProjectModal from "../../components/projects/CreateProjectModal";
import { useToast } from "../../components/Toast";
import ProjectsTable from "../../components/projects/ProjectsTable";
import WelcomeBanner from "../../components/projects/WelcomeBanner";
import { projectsOverviewFor } from "../../mock-data/dashboard-stats";
import { currentUser } from "../../mock-data/users";

/**
 * Inventory view `projects-dashboard` (DashboardLive.Index): the greeting,
 * the user's projects, and the Create project modal.
 */
export default function ProjectsDashboardPage() {
  const [creating, setCreating] = useState(false);
  const toast = useToast();
  const projects = projectsOverviewFor(currentUser.id);

  return (
    <PageContent header={<Header title="Projects" />}>
      <Centered>
        <div className="-mt-6">
          <WelcomeBanner firstName={currentUser.firstName} />
          <div id="user-projects-section">
            <ProjectsTable
              projects={projects}
              onCreate={() => setCreating(true)}
              createButton={
                <Button id="open-create-project-modal-button" className="w-full" onClick={() => setCreating(true)}>
                  Create project
                </Button>
              }
            />
          </div>
          <CreateProjectModal
            open={creating}
            onClose={() => setCreating(false)}
            onCreate={() => toast("Project created successfully")}
          />
        </div>
      </Centered>
    </PageContent>
  );
}
