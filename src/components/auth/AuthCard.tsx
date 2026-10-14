import type { ReactNode } from "react";
import Alert from "../Alert";
import Card from "../Card";
import { cn } from "../../utils/cn";

/**
 * The white form card on logged-out pages: half the centred column on
 * desktop, with the controller's error / info flash at the top. Children
 * stack in a grid, so buttons stretch to the card's width as in Lightning.
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
    <Card padding="lg" className="grid gap-4 sm:w-2/3 md:w-1/2">
      {error && <Alert type="danger">{error}</Alert>}
      {info && <Alert type="info">{info}</Alert>}
      {children}
    </Card>
  );
}

/**
 * The small links row at the bottom of a card: one left, one right.
 * `divider` puts Lightning's `Form.divider` rule above it (hidden on mobile).
 */
export function AuthFooterLinks({ left, right, divider = false }: { left?: ReactNode; right?: ReactNode; divider?: boolean }) {
  return (
    <div className={cn("flex justify-between text-xs text-gray-700", divider && "sm:border-t sm:border-gray-200 sm:pt-5")}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}
