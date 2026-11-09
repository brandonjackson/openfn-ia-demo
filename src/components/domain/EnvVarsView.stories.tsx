import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import EnvVarsView from "./EnvVarsView";
import type { EnvVar } from "../../model/env-vars";
import { projectAEnvVars } from "../../fixtures/env-vars";

/** Plays the server: saves land in the list, as they would once the API answers. */
function Stateful(args: ComponentProps<typeof EnvVarsView>) {
  const [vars, setVars] = useState<EnvVar[]>(args.variables);
  const later = () => new Promise((r) => setTimeout(r, 400));
  return (
    <div className="h-[44rem]">
      <EnvVarsView
        {...args}
        variables={vars}
        onCreate={
          args.onCreate &&
          (async (d) => {
            await later();
            setVars((vs) => [...vs, { id: crypto.randomUUID(), ...d, value: d.secret ? null : d.value, updatedAt: "just now", updatedBy: "You" }].sort((a, b) => a.key.localeCompare(b.key)));
          })
        }
        onUpdate={
          args.onUpdate &&
          (async (id, d) => {
            await later();
            setVars((vs) => vs.map((v) => (v.id === id ? { ...v, ...d, value: d.secret ? null : d.value, updatedAt: "just now", updatedBy: "You" } : v)));
          })
        }
        onDelete={
          args.onDelete &&
          (async (id) => {
            await later();
            setVars((vs) => vs.filter((v) => v.id !== id));
          })
        }
      />
    </div>
  );
}

const meta: Meta<typeof EnvVarsView> = {
  title: "Domain/EnvVarsView",
  component: EnvVarsView,
  parameters: { layout: "fullscreen" },
  args: {
    variables: projectAEnvVars,
    projectName: "Project A",
    onCreate: async () => {},
    onUpdate: async () => {},
    onDelete: async () => {},
  },
  render: (args) => <Stateful {...args} />,
};

export default meta;
type Story = StoryObj<typeof EnvVarsView>;

/** An editor's view: add at the top, open a row to change it. */
export const Default: Story = {};

/** One open to edit in place. */
export const Editing: Story = { args: { defaultExpandedId: "sms-sender" } };

/** For a viewer: the list only, each row opening to who changed it last. */
export const ReadOnly: Story = { args: { onCreate: undefined, onUpdate: undefined, onDelete: undefined } };

export const Empty: Story = { args: { variables: [] } };
