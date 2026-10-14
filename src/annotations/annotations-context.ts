import { createContext, useContext } from "react";

export interface AnnotationsState {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** The view id of the current page, if the route maps to one. */
  pageId: string | null;
  /** What the panel shows: the pinned id, else the hovered element's, else the page's. */
  currentId: string | null;
  pinnedId: string | null;
  /** Pin an id (null to unpin and follow the mouse again). */
  pin: (id: string | null) => void;
}

export const AnnotationsContext = createContext<AnnotationsState>({
  open: false,
  setOpen: () => {},
  pageId: null,
  currentId: null,
  pinnedId: null,
  pin: () => {},
});

export function useAnnotations(): AnnotationsState {
  return useContext(AnnotationsContext);
}
