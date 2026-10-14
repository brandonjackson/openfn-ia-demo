import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import AnnotationsPanel from "./AnnotationsPanel";
import { AnnotationsProvider } from "../../annotations/AnnotationsContext";
import { useAnnotations } from "../../annotations/annotations-context";
import { withRouterAt } from "../../stories/decorators";

function OpenPanel() {
  const { setOpen } = useAnnotations();
  useEffect(() => setOpen(true), [setOpen]);
  return <AnnotationsPanel />;
}

const meta: Meta<typeof AnnotationsPanel> = {
  title: "Devtools/AnnotationsPanel",
  component: AnnotationsPanel,
  decorators: [
    (Story) => (
      <AnnotationsProvider>
        <Story />
      </AnnotationsProvider>
    ),
    withRouterAt("/projects/4adf2644-ed4e-4f97-a24c-ab35b3cb1efa/settings#collaboration"),
  ],
  parameters: { layout: "fullscreen" },
};
export default meta;

export const ProjectSettingsCollaborators: StoryObj = { render: () => <OpenPanel /> };
