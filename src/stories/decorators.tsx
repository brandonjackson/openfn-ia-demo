import { MemoryRouter } from "react-router-dom";
import type { Decorator } from "@storybook/react";
import ShellFixtures from "../app/Shell.fixtures";

/**
 * Wraps a story in a MemoryRouter, and in the shell's fixtures so chrome
 * (the sidebar, the project bar in the breadcrumbs) renders as it does in the
 * app at that URL.
 */
export const withRouter: Decorator = (Story) => (
  <MemoryRouter initialEntries={["/"]}>
    <ShellFixtures>
      <Story />
    </ShellFixtures>
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
      <ShellFixtures>
        <Story />
      </ShellFixtures>
    </MemoryRouter>
  );
