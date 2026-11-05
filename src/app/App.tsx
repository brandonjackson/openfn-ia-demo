import { Routes, Route, Outlet } from "react-router-dom";
import Layout from "../components/patterns/Layout";
import Sidebar from "../components/domain/Sidebar";
import InstanceLogo from "../components/domain/InstanceLogo";
import { useShell } from "../components/domain/shell-context";
import PageRoute from "./PageRoute";
import ShellQuery from "./Shell.query";
import WorkflowEditorPageFixtures from "../pages/WorkflowEditorPage.fixtures";

/** The page frame, with OpenFn's sidebar and the instance's logo in its slots. */
function Framed() {
  const { currentPath, instance } = useShell();
  return (
    <Layout
      currentPath={currentPath}
      sidebar={(drawer) => <Sidebar {...drawer} />}
      logo={<InstanceLogo instance={instance} />}
    >
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <ShellQuery>
      <Routes>
        {/* Full-screen editor lives outside the standard sidebar layout. */}
        <Route path="/workflow-editor" element={<WorkflowEditorPageFixtures />} />
        <Route path="/workflow-editor/:workflowId" element={<WorkflowEditorPageFixtures />} />
        <Route element={<Framed />}>
          <Route path="*" element={<PageRoute />} />
        </Route>
      </Routes>
    </ShellQuery>
  );
}
