import { MemoryRouter } from "react-router-dom";
import type { Decorator } from "@storybook/react";

/**
 * Wraps a story in a MemoryRouter so components using Link / useLocation work.
 */
export const withRouter: Decorator = (Story) => (
  <MemoryRouter initialEntries={["/"]}>
    <Story />
  </MemoryRouter>
);
