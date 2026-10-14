import Button from "../Button";
import type { SsoProvider } from "../../mock-data/auth";

/**
 * The "or / via external provider" block under the login button, shown when
 * an OIDC auth provider is configured (Lightning's `@auth_handler_url`).
 */
export default function SsoLogin({ provider }: { provider: SsoProvider }) {
  return (
    <>
      <div className="text-xs text-secondary-700 border-b border-secondary-200 text-center leading-[0]">
        <span className="px-2 bg-white">or</span>
      </div>
      <Button theme="secondary" href={provider.handlerUrl} tooltip={provider.name} className="w-full">
        <span className="hero-identification h-4 w-4" />
        via external provider
      </Button>
    </>
  );
}
