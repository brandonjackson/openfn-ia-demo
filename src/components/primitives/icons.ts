import { createLucideIcon } from "lucide-react";

/**
 * Icons lucide doesn't have, drawn on its 24px grid with its stroke so they
 * sit beside its own and take the same props.
 */

/** A plus over a minus in a rounded square: what a sandbox changes. */
export const SquarePlusMinus = createLucideIcon("square-plus-minus", [
  ["rect", { x: "3", y: "3", width: "18", height: "18", rx: "5.5", key: "frame" }],
  ["path", { d: "M12 7.5v6", key: "plus-v" }],
  ["path", { d: "M8.5 10.5h7", key: "plus-h" }],
  ["path", { d: "M8.5 16h7", key: "minus" }],
]);
