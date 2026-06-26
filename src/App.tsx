import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import IAPage from "./pages/IAPage";
import WorkflowEditorPage from "./pages/WorkflowEditorPage";

export default function App() {
  return (
    <Routes>
      {/* Full-screen editor lives outside the standard sidebar layout. */}
      <Route path="/workflow-editor" element={<WorkflowEditorPage />} />
      <Route element={<Layout />}>
        <Route path="*" element={<IAPage />} />
      </Route>
    </Routes>
  );
}
