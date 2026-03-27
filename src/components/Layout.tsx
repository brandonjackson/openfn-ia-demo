import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { iaTree } from "../ia-tree";

export default function Layout() {
  return (
    <div className="flex h-screen">
      <Sidebar tree={iaTree} />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
