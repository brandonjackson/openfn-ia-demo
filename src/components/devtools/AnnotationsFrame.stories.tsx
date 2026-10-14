import type { Meta, StoryObj } from "@storybook/react";
import AnnotationsFrame from "./AnnotationsFrame";
import { AnnotationsProvider } from "../../annotations/AnnotationsContext";
import { withRouter } from "../../stories/decorators";

const meta: Meta<typeof AnnotationsFrame> = {
  title: "Devtools/AnnotationsFrame",
  component: AnnotationsFrame,
  decorators: [(Story) => <AnnotationsProvider>{<Story />}</AnnotationsProvider>, withRouter],
  args: { children: <div className="bg-gray-100 p-8 text-sm text-gray-600">The app renders in here.</div> },
};
export default meta;
export const Default: StoryObj<typeof AnnotationsFrame> = {};
