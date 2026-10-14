import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import IconButton from "./IconButton";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl";

const sizes: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-xl",
  xl: "max-w-3xl",
  "2xl": "max-w-5xl",
};

interface Props {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** A line under the title. */
  description?: ReactNode;
  children: ReactNode;
  /** Buttons, right-aligned. The row is reversed, so put the primary action first. */
  footer?: ReactNode;
  size?: ModalSize;
  /**
   * Render only the panel, with no header, padding or footer, for modals
   * that lay out their own content (pickers, browsers, wizards).
   */
  bare?: boolean;
  className?: string;
}

/**
 * The modal: a blurred backdrop and a white rounded-xl panel with a title,
 * optional description, body and footer. Escape and clicking outside close
 * it; focus is trapped inside while it's open.
 */
export default function Modal({ open, onClose, title, description, children, footer, size = "lg", bare = false, className }: Props) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[200]" data-ui="modal">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity duration-200 ease-out data-closed:opacity-0"
      />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className={cn(
              "relative w-full rounded-xl bg-white text-left shadow-lg shadow-zinc-700/10 ring-1 ring-zinc-700/10",
              "transition duration-200 ease-out data-closed:translate-y-2 data-closed:opacity-0",
              !bare && "py-6",
              sizes[size],
              className
            )}
          >
            {bare ? (
              children
            ) : (
              <>
                {title && (
                  <>
                    <header className="flex items-start justify-between gap-4 px-6">
                      <div>
                        <DialogTitle className="text-lg font-semibold leading-5 text-zinc-800">{title}</DialogTitle>
                        {description && <Description className="mt-2 text-sm text-zinc-600">{description}</Description>}
                      </div>
                      <IconButton icon="hero-x-mark" label="Close" size="sm" className="-m-0.5 p-0.5" onClick={onClose} />
                    </header>
                    <div className="my-4 h-0.5 bg-gray-100" />
                  </>
                )}
                <section className="px-6">{children}</section>
                {footer && <footer className="mt-4 flex flex-col-reverse gap-3 px-6 sm:flex-row-reverse">{footer}</footer>}
              </>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
