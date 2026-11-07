import { useEffect, type ReactNode } from "react";
import { useSignedIn } from "../api/account";
import { apiSource } from "../api/source";
import { signInUrl } from "./sign-in";

/**
 * Holds the app back until someone is signed in. On the fake server someone
 * always is. On Lightning the app shares Lightning's session, so when there's
 * none it sends the browser to Lightning's sign-in, which comes back to this
 * screen afterwards (docs/lightning-backend.md, Phase 1).
 */
export default function SignedIn({ children }: { children: ReactNode }) {
  return apiSource === "lightning" ? <LightningSession>{children}</LightningSession> : children;
}

function LightningSession({ children }: { children: ReactNode }) {
  const { signedIn, status } = useSignedIn();

  useEffect(() => {
    if (signedIn === false) window.location.assign(signInUrl(window.location.hash));
  }, [signedIn]);

  // When Lightning couldn't say, let the pages show their own errors.
  return signedIn || status.state === "error" ? children : null;
}
