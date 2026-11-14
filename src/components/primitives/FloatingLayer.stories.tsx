import type { Meta, StoryObj } from "@storybook/react";
import { Pencil, Trash2 } from "lucide-react";
import FloatingLayer from "./FloatingLayer";
import ActionMenu from "./ActionMenu";
import Card from "./Card";
import Inline from "./Inline";
import Text from "./Text";

const meta: Meta<typeof FloatingLayer> = {
  title: "Primitives/FloatingLayer",
  component: FloatingLayer,
};

export default meta;
type Story = StoryObj<typeof FloatingLayer>;

/**
 * Menus open through `FloatingLayer`, so a card that crops what overflows it
 * (here, a short one with `overflow: hidden`) can't cut the menu off.
 */
export const InsideACroppedCard: Story = {
  render: () => (
    <div className="h-64">
      <div className="h-16 overflow-hidden">
        <Card padding="sm">
          <Inline justify="between">
            <Text>Amy Rivera</Text>
            <ActionMenu
              label="Actions for Amy Rivera"
              defaultOpen
              items={[
                { id: "role", label: "Change role", icon: Pencil },
                { id: "remove", label: "Remove", icon: Trash2, tone: "danger", divider: true },
              ]}
              onSelect={() => {}}
            />
          </Inline>
        </Card>
      </div>
    </div>
  ),
};
