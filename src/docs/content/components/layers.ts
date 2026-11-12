import { Box, LayoutTemplate, Workflow, type LucideIcon } from "lucide-react";
import type { CatalogLayer } from "virtual:component-catalog";

/** How each layer is named, drawn and described in the component reference. */
export const layerInfo: Record<CatalogLayer, { title: string; icon: LucideIcon; description: string }> = {
  primitives: { title: "Primitives", icon: Box, description: "The smallest pieces. They know nothing about OpenFn." },
  patterns: { title: "Patterns", icon: LayoutTemplate, description: "The shape of a screen or a region, filled through slots." },
  domain: { title: "Domain", icon: Workflow, description: "Anything in OpenFn's words, from a status up to the canvas." },
};
