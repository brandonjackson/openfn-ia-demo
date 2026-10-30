import { Outlet } from "react-router-dom";
import PageContainer from "./PageContainer";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageContainer>
          <Outlet />
        </PageContainer>
      </main>
    </div>
  );
}
