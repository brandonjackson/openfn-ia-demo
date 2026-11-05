import { Routes, Route } from "react-router-dom";
import Layout from "../components/patterns/Layout";
import IAPage from "./IAPage";
import WorkflowEditorPageFixtures from "../pages/WorkflowEditorPage.fixtures";

export default function App() {
  return (
    <Routes>
      {/* Full-screen editor lives outside the standard sidebar layout. */}
      <Route path="/workflow-editor" element={<WorkflowEditorPageFixtures />} />
      <Route path="/workflow-editor/:workflowId" element={<WorkflowEditorPageFixtures />} />
      <Route element={<Layout />}>
        <Route path="*" element={<IAPage />} />
      </Route>
    </Routes>
  );
}
