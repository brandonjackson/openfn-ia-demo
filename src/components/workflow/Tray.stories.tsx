import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "lucide-react";
import Tray, { TrayIconButton } from "./Tray";
import StepExplorer from "./StepExplorer";
import RecentHistoryPanel from "./RecentHistoryPanel";
import type { TrayId } from "./trays";
import { nationalIdWorkflow } from "../../mock-data/workflow";
import { workOrders } from "../../mock-data/runs";

const meta: Meta<typeof Tray> = {
  title: "Workflow/Tray",
  component: Tray,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex h-[560px] bg-gray-50 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Tray>;

/** A left dock holding Steps and History: the header switches between them. Drag the right edge to resize. */
function LeftDock({ floating = false }: { floating?: boolean }) {
  const [active, setActive] = useState<TrayId>("steps");
  const [size, setSize] = useState(300);
  return (
    <Tray
      dock="left"
      trays={["steps", "history"]}
      active={active}
      onActivate={setActive}
      actions={
        active === "steps" && (
          <TrayIconButton label="Add step">
            <Plus size={15} />
          </TrayIconButton>
        )
      }
      onMove={() => {}}
      onClose={() => {}}
      size={size}
      onResize={setSize}
      floating={floating}
    >
      {active === "steps" ? (
        <StepExplorer workflow={nationalIdWorkflow} selectedId="search" onSelect={() => {}} />
      ) : (
        <RecentHistoryPanel bare workOrders={workOrders} />
      )}
    </Tray>
  );
}

export const Docked: Story = { render: () => <LeftDock /> };

/** As a card, for docks that float over the canvas. */
export const Floating: Story = { render: () => <LeftDock floating /> };

/** A dock with one tray shows its name. The ⋯ menu moves it to another dock. */
export const SingleTray: Story = {
  args: {
    dock: "right",
    trays: ["reference"],
    active: "reference",
    size: 320,
    floating: true,
    onMove: () => {},
    onClose: () => {},
    children: <p className="p-4 text-sm text-gray-500">Adaptor docs go here.</p>,
  },
};
