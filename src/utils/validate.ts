/** A loose email check: something@something, no spaces. */
export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+$/.test(s);
}
