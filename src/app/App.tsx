import { Routes, Route, Outlet } from "react-router-dom";
import Layout from "../components/patterns/Layout";
import PageRoute from "./PageRoute";
import ShellFixtures from "./Shell.fixtures";
import WorkflowEditorPageFixtures from "../pages/WorkflowEditorPage.fixtures";

export default function App() {
  return (
    <ShellFixtures>
      <Routes>
        {/* Full-screen editor lives outside the standard sidebar layout. */}
        <Route path="/workflow-editor" element={<WorkflowEditorPageFixtures />} />
        <Route path="/workflow-editor/:workflowId" element={<WorkflowEditorPageFixtures />} />
        <Route
          element={
            <Layout>
              <Outlet />
            </Layout>
          }
        >
          <Route path="*" element={<PageRoute />} />
        </Route>
      </Routes>
    </ShellFixtures>
  );
}
