import type { ReactNode } from "react";
import { SessionContext, type Session } from "./session";

/**
 * Supplies the signed-in user and instance details to everything below it.
 * main.tsx and Storybook fill it from the session fixture; once wired, from
 * the backend's session endpoint.
 */
export default function SessionProvider({ session, children }: { session: Session; children: ReactNode }) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
