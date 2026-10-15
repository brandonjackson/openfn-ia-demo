import { useState } from "react";
import { authRedirectUri } from "../../utils/urls";
import type { AuthProvider } from "../../types/admin";
import Button from "../Button";
import Card from "../Card";
import Heading from "../Heading";
import { Checkbox, TextInput } from "../Inputs";
import TextLink from "../TextLink";
import { cn } from "../../utils/cn";

type TestState = "unknown" | "success" | "failed";

interface Props {
  provider: AuthProvider;
  onSave?: (provider: AuthProvider) => void;
  onRemove?: () => void;
  /** Result of the (mock) Test button; starts "unknown". */
  initialTestState?: TestState;
}

function TestButton({ state, onTest }: { state: TestState; onTest: () => void }) {
  if (state === "failed")
    return (
      <Button theme="danger" id="test-button">
        <span className="hero-x-mark-solid h-4 w-4" />
        Failed
      </Button>
    );
  if (state === "success")
    return (
      <Button theme="success" id="test-button">
        <span className="hero-check-solid h-4 w-4" />
        Success
      </Button>
    );
  return (
    <Button theme="secondary" id="test-button" onClick={onTest}>
      <span className="hero-beaker-solid h-4 w-4" />
      Test
    </Button>
  );
}

const docsLink = (href: string) => (
  <TextLink to={href} external>
    here &raquo;
  </TextLink>
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
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <TextInput
              id="auth_provider_name"
              label="Name"
              hint="The name of the provider, used in the redirect URI."
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
            />
            <TextInput
              id="auth_provider_discovery_url"
              label="Discovery URL"
              hint={
                <>
                  The URL to the <code>.well-known</code> endpoint.
                </>
              }
              value={values.discoveryUrl}
              onChange={(e) => set("discoveryUrl", e.target.value)}
            />
            <TextInput
              id="auth_provider_client_id"
              label="Client ID"
              value={values.clientId}
              onChange={(e) => set("clientId", e.target.value)}
            />
            <TextInput
              type="password"
              id="client_secret"
              label="Client Secret"
              value={values.clientSecret}
              onChange={(e) => set("clientSecret", e.target.value)}
            />
            <TextInput
              id="auth_provider_redirect_host"
              label="Redirect Host"
              value={values.redirectHost}
              onChange={(e) => set("redirectHost", e.target.value)}
            />
            <Checkbox
              label="Trust unverified emails from this provider"
              hint={
                <>
                  Only enable for a provider you trust that doesn't assert <code>email_verified</code>. Off by default.
                </>
              }
              checked={values.allowUnverifiedEmail}
              onChange={(e) => set("allowUnverifiedEmail", e.target.checked)}
            />
            <div className="flex justify-between sm:border-t sm:border-gray-200 sm:pt-4">
              <Button type="submit" disabled={!valid}>
                Save
              </Button>
              {valid && <TestButton state={testState} onTest={() => setTestState("success")} />}
            </div>
          </div>
          <div className="flex flex-col gap-4 text-sm text-gray-700">
            <p>
              Allows users with existing accounts to login with an external OpenID Connect account that matches their
              email address.
            </p>
            <p>
              In order to make things easier we rely on the providers well-known file to determine all the different
              endpoints for authentication and retrieving the user information. Documentation on Google's OpenID
              Connect support and it's well-known file see{" "}
              {docsLink("https://developers.google.com/identity/protocols/oauth2/openid-connect#discovery")}
            </p>
            <div className="space-y-2 sm:border-t sm:border-gray-200 sm:pt-4">
              <Heading size="sm">Redirect URI</Heading>
              <Card
                muted
                padding="sm"
                id="redirect-uri-preview"
                className={cn("font-mono", !valid && "cursor-not-allowed text-gray-400")}
              >
                {valid ? authRedirectUri(values) : <>{values.redirectHost}&hellip;</>}
              </Card>
              <p>
                Ensure your provider has this redirect URI set. For more information see{" "}
                {docsLink("https://developers.google.com/identity/protocols/oauth2/openid-connect#setredirecturi")}
              </p>
            </div>
            {provider.id !== null && (
              <div className="mt-auto space-y-2">
                <Heading size="sm">Remove</Heading>
                <p>Deletes the Authentication Configuration, and disables external authentication for Lightning.</p>
                <Button theme="danger" onClick={onRemove}>
                  <span className="hero-trash h-4 w-4" />
                  Remove
                </Button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
