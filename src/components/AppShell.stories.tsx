import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AppShell from "./AppShell";
import Header from "./Header";
import { Centered, PageContent } from "./PageContent";
import { projects } from "../mock-data/projects";

const meta: Meta = { title: "Shell/AppShell", parameters: { layout: "fullscreen" } };
export default meta;

const Body = () => (
  <PageContent header={<Header title="Page" />}>
    <Centered>
      <p className="text-sm text-gray-500">Page body</p>
    </Centered>
  </PageContent>
);

const at = (path: string) => () => (
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/projects/:projectId/*" element={<Body />} />
        <Route path="*" element={<Body />} />
      </Route>
    </Routes>
  </MemoryRouter>
);

export const Project: StoryObj = { render: at(`/projects/${projects[0].id}/w`) };
export const Profile: StoryObj = { render: at("/profile") };
export const Admin: StoryObj = { render: at("/settings/projects") };
