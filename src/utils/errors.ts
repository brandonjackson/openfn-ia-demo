/**
 * What a failed request looks like to the UI. Once wired, the HTTP/channel
 * client throws these; until then the mock-data helpers do. Field errors
 * use the field name as the key and Lightning's changeset messages as the
 * values ("can't be blank"), so they drop straight into `Field`'s `errors`.
 */
export class RequestError extends Error {
  /** Per-field messages, keyed by field name, when the server rejected a form. */
  readonly fieldErrors: Record<string, string[]>;
  /** HTTP status or channel reply code, when there is one. */
  readonly status?: number;

  constructor(message: string, options: { fieldErrors?: Record<string, string[]>; status?: number } = {}) {
    super(message);
    this.name = "RequestError";
    this.fieldErrors = options.fieldErrors ?? {};
    this.status = options.status;
  }

  get hasFieldErrors() {
    return Object.keys(this.fieldErrors).length > 0;
  }
}

/** The message to show for any thrown value. */
export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}
