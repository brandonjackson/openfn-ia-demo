import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { OpenFnLogoCollapsed } from "../OpenFnLogo";

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
  const logo = <OpenFnLogoCollapsed className={cn("w-16 h-16 text-black", align === "top" && "mb-6")} />;
  return (
    <section className={cn("bg-gray-50", align === "top" ? "h-full min-h-screen overflow-y-auto" : "min-h-screen")}>
      <div
        className={cn(
          "flex flex-col items-center px-6 py-8 mx-auto",
          align === "centered" && "justify-center md:h-screen lg:py-0"
        )}
      >
        {align === "centered" ? <div className="flex items-center mb-6">{logo}</div> : logo}
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h1>
        {children}
      </div>
    </section>
  );
}

/** A narrow white panel. `lg` is the form panel; `sm` the info panels. */
export function AuthPanel({ size = "lg", children }: { size?: "sm" | "lg"; children: ReactNode }) {
  return (
    <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 mb-4">
      <div className={size === "lg" ? "p-6 space-y-4 md:space-y-6 sm:p-8" : "p-3 space-y-2 md:space-y-4 sm:p-6"}>
        {children}
      </div>
    </div>
  );
}

/** The bold centred heading inside a form panel ("Authentication Code", "Password"). */
export function AuthPanelTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">{children}</h1>
  );
}

/** Helper text under a panel's submit button. */
export function AuthPanelHint({ children }: { children: ReactNode }) {
  return <p className="text-sm font-light text-gray-500">{children}</p>;
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
