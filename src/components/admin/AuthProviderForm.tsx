import { useState, type ReactNode } from "react";
import { authRedirectUri, type AuthProvider } from "../../mock-data/admin";
import Button from "../Button";
import { Checkbox } from "../Inputs";
import LegacyField from "./LegacyField";

type TestState = "unknown" | "success" | "failed";

interface Props {
  provider: AuthProvider;
  onSave?: (provider: AuthProvider) => void;
  onRemove?: () => void;
  /** Result of the (mock) Test button; starts "unknown". */
  initialTestState?: TestState;
}

function Hint({ children }: { children: ReactNode }) {
  return <span className="text-xs text-secondary-500">{children}</span>;
}

function TestButton({ state, onTest }: { state: TestState; onTest: () => void }) {
  if (state === "failed")
    return (
      <Button theme="danger" id="test-button">
        <span className="hero-x-mark-solid h-4 w-4 -ml-1" />
        Failed
      </Button>
    );
  if (state === "success")
    return (
      <Button theme="success" id="test-button">
        <span className="hero-check-solid h-4 w-4 -ml-1" />
        Success
      </Button>
    );
  return (
    <Button theme="secondary" id="test-button" onClick={onTest}>
      <span className="hero-beaker-solid h-4 w-4 -ml-1" />
      Test
    </Button>
  );
}

const docsLink = (href: string) => (
  <a href={href} className="text-blue-500" target="_blank" rel="noreferrer">
    here &raquo;
  </a>
);

/**
 * The OpenID Connect provider form (auth_providers/form_component.ex): the
 * fields on the left, the explanation and redirect URI preview on the right.
 * An existing provider also gets Test and Remove.
 */
export default function AuthProviderForm({ provider, onSave, onRemove, initialTestState = "unknown" }: Props) {
  const [values, setValues] = useState(provider);
  const [testState, setTestState] = useState<TestState>(initialTestState);
  const set = <K extends keyof AuthProvider>(key: K, value: AuthProvider[K]) =>
    setValues((v) => ({ ...v, [key]: value }));
  const valid =
    values.name.trim() !== "" &&
    values.discoveryUrl.trim() !== "" &&
    values.clientId.trim() !== "" &&
    values.clientSecret.trim() !== "" &&
    values.redirectHost.trim() !== "";

  return (
    <div id={`auth-provider-form-${provider.id ?? "new"}`}>
      <form
        id="auth-provider-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave?.(values);
        }}
      >
        <div className="grid grid-cols-6 gap-6">
          <div className="col-span-3">
            <div className="grid grid-flow-row auto-rows-max gap-4">
              <div>
                <LegacyField
                  id="auth_provider_name"
                  label="Name"
                  hint={<Hint>The name of the provider, used in the redirect URI.</Hint>}
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div>
                <LegacyField
                  id="auth_provider_discovery_url"
                  label="Discovery URL"
                  hint={
                    <Hint>
                      The URL to the <code>.well-known</code> endpoint.
                    </Hint>
                  }
                  value={values.discoveryUrl}
                  onChange={(e) => set("discoveryUrl", e.target.value)}
                />
              </div>
              <div>
                <LegacyField
                  id="auth_provider_client_id"
                  label="Client ID"
                  value={values.clientId}
                  onChange={(e) => set("clientId", e.target.value)}
                />
              </div>
              <div>
                <LegacyField
                  type="password"
                  id="client_secret"
                  label="Client Secret"
                  value={values.clientSecret}
                  onChange={(e) => set("clientSecret", e.target.value)}
                />
              </div>
              <div>
                <LegacyField
                  id="auth_provider_redirect_host"
                  label="Redirect Host"
                  value={values.redirectHost}
                  onChange={(e) => set("redirectHost", e.target.value)}
                />
              </div>
              <div>
                <Checkbox
                  label="Trust unverified emails from this provider"
                  checked={values.allowUnverifiedEmail}
                  onChange={(e) => set("allowUnverifiedEmail", e.target.checked)}
                />
                <Hint>
                  Only enable for a provider you trust that doesn't assert <code>email_verified</code>. Off by default.
                </Hint>
              </div>
            </div>
            <div className="hidden sm:block mt-4" aria-hidden="true">
              <div className="border-t border-secondary-200" />
            </div>
            <div className="mt-4">
              <div className="flex">
                <div className="flex-none">
                  <Button type="submit" disabled={!valid}>
                    Save
                  </Button>
                </div>
                <div className="grow" />
                <div className="flex-none">
                  {valid && <TestButton state={testState} onTest={() => setTestState("success")} />}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-3">
            <div className="flex flex-col h-full">
              <div className="flex-none text-sm text-secondary-700">
                <p>
                  Allows users with existing accounts to login with an external OpenID Connect account that matches
                  their email address.
                </p>
                <p className="mt-2">
                  In order to make things easier we rely on the providers well-known file to determine all the
                  different endpoints for authentication and retrieving the user information. Documentation on
                  Google's OpenID Connect support and it's well-known file see{" "}
                  {docsLink("https://developers.google.com/identity/protocols/oauth2/openid-connect#discovery")}
                </p>
              </div>
              <div className="flex-none hidden sm:block mt-4" aria-hidden="true">
                <div className="border-t border-secondary-200" />
              </div>
              <div className="flex-none mt-4">
                <div className="font-medium text-sm text-secondary-700">Redirect URI</div>
                {valid ? (
                  <div
                    id="redirect-uri-preview"
                    className="font-mono border rounded-md mt-4 p-2 text-secondary-700 bg-gray-200 border-slate-300 shadow-xs"
                  >
                    {authRedirectUri(values)}
                  </div>
                ) : (
                  <div
                    id="redirect-uri-preview"
                    className="font-mono border rounded-md mt-4 p-2 text-gray-400 bg-gray-200 border-slate-300 shadow-xs cursor-not-allowed"
                  >
                    {values.redirectHost}&hellip;
                  </div>
                )}
                <p className="mt-2 text-sm text-secondary-700">
                  Ensure your provider has this redirect URI set. For more information see{" "}
                  {docsLink("https://developers.google.com/identity/protocols/oauth2/openid-connect#setredirecturi")}
                </p>
              </div>
              {provider.id !== null && (
                <>
                  <div className="grow" />
                  <div className="flex-none mt-4">
                    <div className="font-medium text-sm text-secondary-700">Remove</div>
                    <p className="my-2 text-sm text-secondary-700">
                      Deletes the Authentication Configuration, and disables external authentication for Lightning.
                    </p>
                    <Button theme="danger" onClick={onRemove}>
                      <span className="hero-trash h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
