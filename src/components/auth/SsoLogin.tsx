import Button from "../Button";
import type { SsoProvider } from "../../types/auth";

/**
 * The "or / via external provider" block under the login button, shown when
 * an OIDC auth provider is configured (Lightning's `@auth_handler_url`).
 */
export default function SsoLogin({ provider }: { provider: SsoProvider }) {
  return (
    <>
      <div className="flex items-center gap-2 text-xs text-gray-700">
        <hr className="flex-1 border-gray-200" />
        or
        <hr className="flex-1 border-gray-200" />
      </div>
      <Button theme="secondary" href={provider.handlerUrl} tooltip={provider.name} className="w-full">
        <span className="hero-identification h-4 w-4" />
        via external provider
      </Button>
    </>
  );
}
