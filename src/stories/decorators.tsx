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

/**
 * Like {@link withRouter}, but starts the router at a given URL so
 * location-aware components (e.g. the sidebar) render that context.
 */
export const withRouterAt =
  (path: string): Decorator =>
  (Story) => (
    <MemoryRouter initialEntries={[path]}>
      <Story />
    </MemoryRouter>
  );
