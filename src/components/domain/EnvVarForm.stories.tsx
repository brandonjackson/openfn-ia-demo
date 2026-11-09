import type { Meta, StoryObj } from "@storybook/react";
import EnvVarForm from "./EnvVarForm";
import { projectAEnvVars } from "../../fixtures/env-vars";
import { FormError } from "../../model/form-error";

const meta: Meta<typeof EnvVarForm> = {
  title: "Domain/EnvVarForm",
  component: EnvVarForm,
  parameters: { layout: "padded" },
  args: {
    existing: projectAEnvVars,
    onCreate: () => new Promise((resolve) => setTimeout(resolve, 400)),
  },
};

export default meta;
type Story = StoryObj<typeof EnvVarForm>;

/** One empty row. Paste a .env file into the key to fill a row for each line. */
export const Default: Story = {};

/** Several rows, as after pasting a .env file. Save checks LOG_LEVEL is already set everywhere. */
export const SeveralRows: Story = {
  args: {
    defaultRows: [
      { key: "OPENCRVS_URL", value: "https://opencrvs.gov.example" },
      { key: "RETRY_LIMIT", value: "3" },
      { key: "LOG_LEVEL", value: "debug" },
    ],
  },
};

/** The server refuses one: it stays, with why under its key. */
export const Refused: Story = {
  args: {
    defaultRows: [{ key: "REGION", value: "eu" }],
    onCreate: () => Promise.reject(new FormError("The request body is not valid.", { key: ["is already set in production"] })),
  },
};
