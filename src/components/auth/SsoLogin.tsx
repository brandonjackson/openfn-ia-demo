import { buttonClasses } from "../buttonClasses";
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
      <a href={provider.handlerUrl} className={buttonClasses("secondary", "md", false, "w-full")} title={provider.name}>
        <div className="-ml-1 inline-flex items-center">
          <span className="hero-identification h-4 w-4 inline-block" />
          <span className="ml-1 inline-block align-middle">via external provider</span>
        </div>
      </a>
    </>
  );
}
