import { MemoryRouter } from "react-router-dom";
import type { Decorator } from "@storybook/react";
import { cn } from "../utils/cn";

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

/**
 * A gray page background with stacked spacing, for panels that render
 * several cards (often as a fragment), e.g. the project settings panels.
 */
export const withGrayPanel: Decorator = (Story) => (
  <div className="space-y-4 bg-gray-100 p-6">
    <Story />
  </div>
);

/**
 * Pins a side panel (inspector, settings, AI assistant) to the right edge of
 * a gray area of the given height.
 */
export const withSidePanel =
  (height = "h-150"): Decorator =>
  (Story) => (
    <div className={cn("flex justify-end bg-gray-100", height)}>
      <Story />
    </div>
  );

/** A padded white tile of the given width, for charts and small cards. */
export const withWhitePanel =
  (width = "w-96"): Decorator =>
  (Story) => (
    <div className={cn("bg-white p-6", width)}>
      <Story />
    </div>
  );

/**
 * A positioned gray area of the given height, for overlays that sit
 * absolutely on the workflow canvas (controls, minimap, mini history).
 */
export const withCanvas =
  (height: string): Decorator =>
  (Story) => (
    <div className={cn("relative bg-gray-100", height)}>
      <Story />
    </div>
  );
