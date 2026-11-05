import type { Meta, StoryObj } from "@storybook/react";
import Layout from "./Layout";
import Sidebar from "../domain/Sidebar";
import InstanceLogo from "../domain/InstanceLogo";
import { useShell } from "../domain/shell-context";
import { withRouterAt } from "../../stories/decorators";

/** The frame with OpenFn's sidebar and logo in its slots, as the app fills them. */
function Framed() {
  const { currentPath, instance } = useShell();
  return (
    <Layout
      currentPath={currentPath}
      sidebar={(drawer) => <Sidebar {...drawer} />}
      logo={<InstanceLogo instance={instance} />}
    >
      <p className="text-sm text-gray-500">The page goes here.</p>
    </Layout>
  );
}

const meta: Meta<typeof Layout> = {
  title: "Patterns/Layout",
  component: Layout,
  parameters: { layout: "fullscreen" },
  render: () => <Framed />,
};

export default meta;
type Story = StoryObj<typeof Layout>;

/** The frame every page outside the editor sits in: sidebar, and the page's column. */
export const Default: Story = {
  decorators: [withRouterAt("/overview")],
};

/** Inside a project, the sidebar swaps to the project's own menu. */
export const InAProject: Story = {
  decorators: [withRouterAt("/projects/project-a/workflows")],
};
