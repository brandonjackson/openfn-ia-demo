/**
 * What a form does when it's submitted with something missing or wrong: it
 * moves focus to the first field with a problem, so the message under it is
 * read out and the person can fix it at once. `fields` are the form's fields
 * in the order they're drawn, each its input's id and its problem, if any.
 * Says whether there was one.
 */
export function focusFirstProblem(fields: [id: string, problem: unknown][]): boolean {
  const first = fields.find(([, problem]) => Boolean(problem));
  if (!first) return false;
  document.getElementById(first[0])?.focus();
  return true;
}
