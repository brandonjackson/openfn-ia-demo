import type { Meta, StoryObj } from "@storybook/react";
import ConnectSystemPicker from "./ConnectSystemPicker";
import Modal from "../Modal";
import { connectedSystems } from "../../mock-data/connected-systems";

const connected = connectedSystems.map((s) => s.adaptor);

const meta: Meta<typeof ConnectSystemPicker> = {
  title: "Workflow/ConnectSystemPicker",
  component: ConnectSystemPicker,
  args: { connected, onSelect: () => {} },
  decorators: [
    (Story) => (
      <div className="max-w-3xl rounded-xl border border-gray-200 bg-white p-5">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConnectSystemPicker>;

/** Opens on the systems this project is already connected to, beside the built-in tools. */
export const Connected: Story = {};

export const AI: Story = { args: { initialCategory: "ai" } };

export const Health: Story = { args: { initialCategory: "health" } };

export const DataAndFiles: Story = { args: { initialCategory: "data" } };

/** A project that isn't connected to anything yet. */
export const NothingConnected: Story = { args: { connected: [] } };

/** As the canvas opens it, from a step's +. */
export const InDialog: Story = {
  decorators: [
    (Story) => (
      <Modal open title="Connect a system" onClose={() => {}} widthClass="max-w-3xl">
        <Story />
      </Modal>
    ),
  ],
};
