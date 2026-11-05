/**
 * A save the server refused, as a form shows it: a message for the whole
 * form, and a message per field it names (`name`, `members.0.email`). The
 * API client's errors are FormErrors, so a component can show a refusal
 * under the right field without knowing where the data comes from.
 */
export class FormError extends Error {
  /** Every problem with each field, keyed by the field's name. */
  readonly fieldErrors: Record<string, string[]>;

  constructor(message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = "FormError";
    this.fieldErrors = fieldErrors;
  }

  /** The first problem with one field, as a sentence for under it ("has invalid format"), or undefined. */
  fieldError(field: string): string | undefined {
    return this.fieldErrors[field]?.[0];
  }
}

/** A field's problem from any error a save rejected with, or undefined. */
export const fieldErrorOf = (error: unknown, field: string): string | undefined =>
  error instanceof FormError ? error.fieldError(field) : undefined;

/** What to say about a failed save when no field explains it. */
export const errorMessageOf = (error: unknown): string =>
  error instanceof Error ? error.message : "Something went wrong. Try again.";
