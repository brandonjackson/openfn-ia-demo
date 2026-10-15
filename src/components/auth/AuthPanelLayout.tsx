import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import Card from "../Card";
import Heading from "../Heading";
import { OpenFnLogoCollapsed } from "../shell/OpenFnLogo";

/**
 * The full-screen gray layout used by the two-factor, confirm-access and
 * confirmation-required pages: the black boxed Fn logo, a title, then a
 * stack of narrow white panels. `centered` pins the stack to the middle of
 * the screen (two-factor, confirm access); `top` lets it scroll from the top
 * (confirmation required).
 */
export default function AuthPanelLayout({
  title,
  align = "centered",
  children,
}: {
  title: ReactNode;
  align?: "centered" | "top";
  children: ReactNode;
}) {
  return (
    <section
      data-ui="page-body"
      className={cn(
        "flex min-h-screen flex-col items-center gap-4 bg-gray-50 px-6 py-8",
        align === "centered" && "justify-center lg:py-0"
      )}
    >
      <OpenFnLogoCollapsed className="h-16 w-16 text-black" />
      <Heading as="h1" size="xl">
        {title}
      </Heading>
      {children}
    </section>
  );
}

/** A narrow white panel. `lg` is the form panel; `sm` the info panels. */
export function AuthPanel({ size = "lg", className, children }: { size?: "sm" | "lg"; className?: string; children: ReactNode }) {
  return (
    <Card padding={size === "lg" ? "lg" : "sm"} className={cn("w-full space-y-4 sm:max-w-md", className)}>
      {children}
    </Card>
  );
}

/** The bold centred heading inside a form panel ("Authentication Code", "Password"). */
export function AuthPanelTitle({ children }: { children: ReactNode }) {
  return (
    <Heading as="h2" size="xl" className="text-center text-2xl">
      {children}
    </Heading>
  );
}

/** The "Having problems?" panel with alternative sign-in options. */
export function HavingProblems({ children }: { children: ReactNode }) {
  return (
    <AuthPanel size="sm">
      <div>
        Having problems?
        <ul className="list-disc pl-4">{children}</ul>
      </div>
    </AuthPanel>
  );
}

/** Helper text under a panel's submit button. */
export function AuthPanelHint({ children }: { children: ReactNode }) {
  return <p className="text-sm text-gray-500">{children}</p>;
}
