import LiveDashboardHome from "../../components/admin/LiveDashboardHome";
import { liveDashboard } from "../../mock-data/admin";

/**
 * Inventory view `admin-live-dashboard` (Phoenix.LiveDashboard at /dashboard).
 * Third party: a static, labelled approximation of its home page.
 */
export default function AdminLiveDashboardPage() {
  return <LiveDashboardHome data={liveDashboard} />;
}
