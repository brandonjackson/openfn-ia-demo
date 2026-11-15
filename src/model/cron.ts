/**
 * A cron trigger's schedule: five fields (minute, hour, day of month, month,
 * day of week), read in UTC, as Lightning stores it. Lightning's own form
 * offers a frequency first and fills the expression in; `cronFrequencies` is
 * that list, and `describeCron` reads an expression back in words.
 */

/** The schedule a cron trigger starts with, as Lightning's does: every day at midnight. */
export const defaultCron = "0 0 * * *";

/** How often a schedule runs, as Lightning's cron form offers it, each with the expression it starts from. */
export const cronFrequencies = [
  { id: "hourly", label: "Every hour", expression: "0 * * * *" },
  { id: "daily", label: "Every day", expression: "0 0 * * *" },
  { id: "weekly", label: "Every week", expression: "0 0 * * 1" },
  { id: "monthly", label: "Every month", expression: "0 0 1 * *" },
  { id: "custom", label: "Custom", expression: undefined },
] as const;

export type CronFrequency = (typeof cronFrequencies)[number]["id"];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const fieldsOf = (expression: string) => expression.trim().split(/\s+/);
const isNumber = (s: string | undefined) => s !== undefined && /^\d+$/.test(s);
const pad = (n: string) => n.padStart(2, "0");

/** Each field's range, for checking a plain number or a step. */
const RANGES: [number, number][] = [
  [0, 59],
  [0, 23],
  [1, 31],
  [1, 12],
  [0, 7],
];

/** Whether one field is something cron reads: `*`, a number, a range, a list or a step of those. */
function fieldOk(field: string, [min, max]: [number, number]): boolean {
  return field.split(",").every((part) => {
    const [base, step] = part.split("/");
    if (step !== undefined && !(isNumber(step) && Number(step) > 0)) return false;
    if (base === "*") return true;
    const ends = base!.split("-");
    if (ends.length > 2 || !ends.every(isNumber)) return false;
    return ends.every((n) => Number(n) >= min && Number(n) <= max);
  });
}

/**
 * An expression moved to another frequency, keeping the minute and hour it
 * had where it had them: "30 6 * * *" every week is "30 6 * * 1". Custom
 * keeps it as it is.
 */
export function withFrequency(expression: string, frequency: CronFrequency): string {
  const preset = cronFrequencies.find((f) => f.id === frequency)?.expression;
  if (!preset) return expression;
  const [m, h] = fieldsOf(expression);
  const fields = fieldsOf(preset);
  if (isNumber(m)) fields[0] = m!;
  if (frequency !== "hourly" && isNumber(h)) fields[1] = h!;
  return fields.join(" ");
}

/** What's wrong with a schedule, said as what to do about it; undefined when it reads. */
export function cronProblem(expression: string): string | undefined {
  if (!expression.trim()) return "Enter a schedule";
  const fields = fieldsOf(expression);
  if (fields.length !== 5) return "Enter five fields: minute, hour, day of month, month and day of week";
  const bad = fields.findIndex((f, i) => !fieldOk(f, RANGES[i]!));
  if (bad >= 0) return `The ${["minute", "hour", "day of month", "month", "day of week"][bad]} (${fields[bad]}) isn't one cron can read`;
  return undefined;
}

/** Which of the frequencies an expression is, by its shape: "Every day" for any `m h * * *`. */
export function frequencyOf(expression: string): CronFrequency {
  const [m, h, dom, mon, dow] = fieldsOf(expression);
  if (fieldsOf(expression).length !== 5 || mon !== "*") return "custom";
  if (isNumber(m) && h === "*" && dom === "*" && dow === "*") return "hourly";
  if (isNumber(m) && isNumber(h) && dom === "*" && dow === "*") return "daily";
  if (isNumber(m) && isNumber(h) && dom === "*" && isNumber(dow)) return "weekly";
  if (isNumber(m) && isNumber(h) && isNumber(dom) && dow === "*") return "monthly";
  return "custom";
}

/**
 * A schedule in words, the way a card or a hint says it: "Every day at
 * 06:00", "Every Monday at 00:00", "Every hour at minute 15". One that isn't
 * a common shape reads as itself, "On the schedule 0 9-17 * * 1-5".
 */
export function describeCron(expression: string): string {
  const [m, h, dom, , dow] = fieldsOf(expression);
  const at = `${pad(h ?? "0")}:${pad(m ?? "0")}`;
  switch (frequencyOf(expression)) {
    case "hourly":
      return m === "0" ? "Every hour" : `Every hour at minute ${m}`;
    case "daily":
      return `Every day at ${at}`;
    case "weekly":
      return `Every ${DAYS[Number(dow) % 7]} at ${at}`;
    case "monthly":
      return `On day ${dom} of every month at ${at}`;
    default:
      return `On the schedule ${expression.trim()}`;
  }
}

/** What a trigger's card says under its name: its schedule, or what a webhook or Kafka trigger answers to. */
export function triggerSubtitle(type: "webhook" | "cron" | "kafka", cron?: string): string {
  if (type === "cron") return describeCron(cron ?? defaultCron);
  return type === "kafka" ? "On each message" : "On each request received";
}

/** The trigger's one-line summary for its canvas card. */
export function triggerSummary(type: "webhook" | "cron" | "kafka", cron?: string): string {
  if (type === "cron") return `**Starts a run** ${describeCron(cron ?? defaultCron).replace(/^Every/, "every").replace(/^On/, "on")}.`;
  return type === "kafka" ? "**Starts a run** for each message." : "**Starts a run** for each request received.";
}
