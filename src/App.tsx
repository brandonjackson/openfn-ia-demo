import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import IAPage from "./pages/IAPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="*" element={<IAPage />} />
      </Route>
    </Routes>
  );
}
