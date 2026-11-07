/** A way of authenticating calls to the project's webhook triggers. */
export interface WebhookAuthMethod {
  id: string;
  /** Unique in the project. */
  name: string;
  type: WebhookAuthType;
  /** The basic auth username; absent for an API key. */
  username?: string;
  /** The API key or password with all but its last characters hidden. The full secret is shown once, when it's made. */
  maskedSecret: string;
  /** The webhook triggers that require it, by id (see `WebhookTriggerOption`). */
  triggerIds: string[];
}

/** A webhook trigger in the project that an auth method can protect. */
export interface WebhookTriggerOption {
  id: string;
  /** The workflow it starts. */
  workflowName: string;
}

/** A new webhook auth method as typed into the form. */
export interface WebhookAuthMethodDraft {
  name: string;
  type: WebhookAuthType;
  /** Basic auth only. */
  username?: string;
  /** Basic auth only. */
  password?: string;
  /** The webhook triggers to protect straight away. */
  triggerIds: string[];
}

/** Basic HTTP auth (a username and password) or an API key in the `x-api-key` header. */
export type WebhookAuthType = "basic" | "api";
