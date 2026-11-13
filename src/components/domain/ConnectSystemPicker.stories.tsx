import type { Meta, StoryObj } from "@storybook/react";
import ConnectSystemPicker from "./ConnectSystemPicker";
import Modal from "../primitives/Modal";
import { connectedSystems } from "../../fixtures/connected-systems";
import { stepServices } from "../../fixtures/projects";
import { adaptorCatalog, aiActions, aiModels, builtInTools, catalogCategories } from "../../fixtures/adaptor-catalog";

const connected = connectedSystems.map((s) => s.adaptor);
const catalog = { adaptors: adaptorCatalog, categories: catalogCategories, builtInTools, aiModels, aiActions };

const meta: Meta<typeof ConnectSystemPicker> = {
  title: "Domain/ConnectSystemPicker",
  component: ConnectSystemPicker,
  args: { catalog, connected, services: stepServices, onSelect: () => {} },
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

/** The organisation's Live services a step can call, under who offers each. */
export const Services: Story = { args: { initialCategory: "services" } };

/** Nothing published yet: the tab says where services come from. */
export const NoServices: Story = { args: { initialCategory: "services", services: [] } };

/** Without the service catalog there's no Services tab, and search looks only at systems and tools. */
export const WithoutServices: Story = { args: { services: undefined } };

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
