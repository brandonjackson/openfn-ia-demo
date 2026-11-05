/**
 * What's wrong with a piece of JSON someone typed as a run input, or null when
 * it's fine. Inputs must be a JSON object, the shape a run's state takes.
 */
export function describeJsonProblem(body: string): string | null {
  try {
    const parsed: unknown = JSON.parse(body);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return "This needs to be a JSON object.";
    }
    return null;
  } catch {
    return "This isn't valid JSON.";
  }
}
