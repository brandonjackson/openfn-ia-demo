import type { ReactNode } from "react";
import FlashAlert from "./FlashAlert";

/**
 * The white form card on logged-out pages: half the centred column on
 * desktop, with the controller's error / info flash at the top.
 */
export default function AuthCard({
  error,
  info,
  children,
}: {
  error?: ReactNode;
  info?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-6 gap-6">
      <div className="col-span-6 md:col-span-3 sm:col-span-4 border border-secondary-200 rounded-md shadow-xs bg-white p-6">
        {error && <FlashAlert kind="danger">{error}</FlashAlert>}
        {info && <FlashAlert kind="info">{info}</FlashAlert>}
        {children}
      </div>
    </div>
  );
}

/** The card's vertical field stack (`grid grid-flow-row gap-4 auto-rows-max`). */
export function AuthFormStack({ children }: { children: ReactNode }) {
  return <div className="grid grid-flow-row gap-4 auto-rows-max">{children}</div>;
}

/** Lightning's `Form.divider`: a rule with py-5 around it, hidden on mobile. */
export function FormDivider() {
  return (
    <div className="hidden sm:block" aria-hidden="true">
      <div className="py-5">
        <div className="border-t border-secondary-200" />
      </div>
    </div>
  );
}

/** The small links row at the bottom of a card: one left, one right. */
export function AuthFooterLinks({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  return (
    <div className="text-xs text-secondary-700">
      <div className="flex">
        <div className="flex-none">{left}</div>
        <div className="grow" />
        <div className="flex-none">{right}</div>
      </div>
    </div>
  );
}
