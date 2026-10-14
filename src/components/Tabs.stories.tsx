import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Tabs from "./Tabs";
import IconButton from "./IconButton";

const meta: Meta<typeof Tabs> = { title: "Shared/Tabs", component: Tabs };
export default meta;
type Story = StoryObj<typeof Tabs>;

function Stateful({ withAdd = false }: { withAdd?: boolean }) {
  const [tabs, setTabs] = useState(["main", "staging", "production"]);
  const [active, setActive] = useState("main");
  return (
    <Tabs
      label="Environments"
      tabs={tabs.map((t) => ({ id: t, label: t }))}
      active={active}
      onChange={setActive}
      after={
        withAdd && (
          <IconButton icon="hero-plus" label="Add new environment" onClick={() => setTabs((l) => [...l, `env${l.length + 1}`])} />
        )
      }
    />
  );
}

export const Default: Story = { render: () => <Stateful /> };
/** With a trailing add button, as in the credential form's environments. */
export const WithAddButton: Story = { render: () => <Stateful withAdd /> };
