/** Which edge of the trigger a floating panel lines up with. */
export type FloatingAlign = "start" | "end";

/**
 * The white card Menus and Popovers open as, with a short fade. It stacks
 * above the sidebar (z-100) and modals (z-200), so menus work inside both.
 */
export const floatingPanelClasses =
  "z-[300] rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0";
