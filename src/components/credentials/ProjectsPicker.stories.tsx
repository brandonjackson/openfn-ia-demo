import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ProjectsPicker from "./ProjectsPicker";
import { projects } from "../../mock-data/projects";

const meta: Meta<typeof ProjectsPicker> = { title: "Credentials/ProjectsPicker", component: ProjectsPicker };
export default meta;
type Story = StoryObj<typeof ProjectsPicker>;

function Stateful({ initial, type }: { initial: string[]; type: "credential" | "oauth_client" }) {
  const [ids, setIds] = useState(initial);
  return <ProjectsPicker id="new" type={type} projects={projects} selectedIds={ids} onChange={setIds} />;
}

export const Empty: Story = { render: () => <Stateful initial={[]} type="credential" /> };
export const WithProjects: Story = {
  render: () => <Stateful initial={[projects[0].id, projects[1].id]} type="credential" />,
};
export const OauthClient: Story = { render: () => <Stateful initial={[]} type="oauth_client" /> };
