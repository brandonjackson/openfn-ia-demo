import type { Environment } from "../../model/credentials";
import { ENVIRONMENTS, environmentLabels } from "../../model/credentials";
import Checkbox from "../primitives/Checkbox";
import Inline from "../primitives/Inline";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  /** The environments ticked. */
  value: Environment[];
  onChange: (value: Environment[]) => void;
  /** What's wrong with the choice, e.g. none ticked. */
  error?: string;
  /** Prefixes each box's id; the first box's is `${idPrefix}-production`, for moving focus to it. */
  idPrefix: string;
}

/**
 * Which environments something applies to, as one checkbox each:
 * Production, Staging and Mock, in that order.
 */
export default function EnvironmentChecklist({ value, onChange, error, idPrefix }: Props) {
  const toggle = (env: Environment, on: boolean) => onChange(ENVIRONMENTS.filter((e) => (e === env ? on : value.includes(e))));
  return (
    <Stack gap="xs">
      <Inline gap="md" wrap>
        {ENVIRONMENTS.map((env) => (
          <Checkbox key={env} id={`${idPrefix}-${env}`} label={environmentLabels[env]} checked={value.includes(env)} onChange={(on) => toggle(env, on)} />
        ))}
      </Inline>
      {error && (
        <Text tone="danger" size="xs" role="status">
          {error}
        </Text>
      )}
    </Stack>
  );
}
