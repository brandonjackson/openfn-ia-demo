import Header from "../../components/Header";
import { Centered, PageContent } from "../../components/PageContent";
import MaintenanceCard from "../../components/admin/MaintenanceCard";
import { useToast } from "../../components/Toast";

/**
 * Inventory view `admin-maintenance` (MaintenanceLive.Index): /settings/maintenance.
 * Run only shows Lightning's confirmation toast here.
 */
export default function AdminMaintenancePage() {
  const toast = useToast();
  return (
    <PageContent header={<Header title="Maintenance" />}>
      <Centered>
        <div className="flex flex-col gap-4">
          <MaintenanceCard
            id="refresh-adaptors-card"
            title="Refresh Adaptor Registry"
            description="Re-fetch the list of available adaptors and their versions."
            onRun={() => toast("Adaptor refresh queued.")}
          />
          <MaintenanceCard
            id="refresh-icons-card"
            title="Refresh Adaptor Icons"
            description="Re-fetch icons for every adaptor and replace rows whose icon has changed. Does not touch adaptor metadata or version history."
            onRun={() => toast("Icon refresh started.")}
          />
        </div>
      </Centered>
    </PageContent>
  );
}
