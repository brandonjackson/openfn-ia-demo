import type { Meta, StoryObj } from "@storybook/react";
import { ArrowLeftRight, Globe, LibraryBig } from "lucide-react";
import BuildingBlockTile from "./BuildingBlockTile";
import { withRouter } from "../stories/decorators";
import { buildChannels, buildServices, buildSystems } from "../mock-data/build-ideas";

const meta: Meta<typeof BuildingBlockTile> = {
  title: "Components/BuildingBlockTile",
  component: BuildingBlockTile,
  decorators: [
    withRouter,
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BuildingBlockTile>;

export const System: Story = { args: { block: buildSystems[0], icon: Globe } };

export const Channel: Story = { args: { block: buildChannels[0], icon: ArrowLeftRight } };

export const Service: Story = { args: { block: buildServices[0], icon: LibraryBig } };
