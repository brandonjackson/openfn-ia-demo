import type { Meta, StoryObj } from "@storybook/react";
import PublishToXRoadModal from "./PublishToXRoadModal";
import { openfnClientId, orgXRoad } from "../../fixtures/xroad";

const meta: Meta<typeof PublishToXRoadModal> = {
  title: "Patterns/PublishToXRoadModal",
  component: PublishToXRoadModal,
  args: {
    open: true,
    onClose: () => {},
    onPublished: () => {},
    serviceName: "Register a suspected case",
    serviceCode: "register-case",
    descriptionUrl: "https://app.openfn.org/i/case-surveillance/register-suspected-case/openapi.json",
    backendUrl: "https://app.openfn.org/i/case-surveillance/register-suspected-case",
    subsystem: openfnClientId,
    clients: ["FJ/GOV/NRH/OPENMRS", "FJ/GOV/NDHO/SURVEILLANCE"],
    securityServer: orgXRoad.securityServers[0].address,
  },
};

export default meta;
type Story = StoryObj<typeof PublishToXRoadModal>;

export const Default: Story = {};

export const NoClientsYet: Story = { args: { clients: [] } };
