import { Plus } from "lucide-react";
import type { ProjectCredential } from "../../model/adaptor-reference";
import { environmentLabels, type Environment } from "../../model/credentials";
import Button from "../primitives/Button";
import Card from "../primitives/Card";
import Stack from "../primitives/Stack";
import Text from "../primitives/Text";

interface Props {
  /** The project's credentials that can reach the step's system and have values where it runs (`credentialsForStep`). */
  options: ProjectCredential[];
  /** The credential the step runs with now, if any. It may have no values where the step runs. */
  current?: ProjectCredential;
  /** Where the step runs: the sandbox's environment, or "production" on main. */
  environment: string;
  /** What the credential reaches, for the words: the system's name, or the adaptor's for a step on none. */
  target: string;
  /** On main nothing can be changed: only the current credential shows. */
  readOnly?: boolean;
  /** Gives the step a credential in one click, or takes it off (`undefined`). */
  onChoose?: (credentialId: string | undefined) => void;
  /** Opens the credential form, set to the system's kind of credential. Left out, there's no New credential. */
  onNew?: () => void;
}

/**
 * The credential a step runs with, and the ones it could, so connecting a
 * step is one click rather than typing anything in. It lists the project's
 * credentials for the step's system that have values for the environment
 * the step runs in, each with Add (Use once the step has one), and New
 * credential for when none fits.
 */
export default function StepCredentialPicker({ options, current, environment, target, readOnly = false, onChoose, onNew }: Props) {
  const where = environmentLabels[environment as Environment] ?? environment;
  const others = options.filter((c) => c.id !== current?.id);
  const missingHere = current && !options.some((c) => c.id === current.id);

  return (
    <Stack gap="sm">
      {current ? (
        <Card
          padding="sm"
          title={current.name}
          description={missingHere ? `Has no ${where.toLowerCase()} values: runs here will fail to connect.` : `Owned by ${current.owner}`}
          actions={
            !readOnly && onChoose ? (
              <Button variant="ghost" size="xs" onClick={() => onChoose(undefined)} aria-label={`Remove ${current.name}`}>
                Remove
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Text size="sm" tone="muted">
          {readOnly ? "None" : `No credential yet. Pick one with ${where.toLowerCase()} values for ${target}.`}
        </Text>
      )}

      {!readOnly && (
        <>
          {others.length > 0 && (
            <Stack gap="sm" label={`Credentials for ${target} in ${where.toLowerCase()}`}>
              {others.map((c) => (
                <Card
                  key={c.id}
                  padding="sm"
                  title={c.name}
                  description={`Owned by ${c.owner}`}
                  actions={
                    onChoose && (
                      <Button variant="secondary" size="xs" icon={current ? undefined : Plus} onClick={() => onChoose(c.id)} aria-label={`${current ? "Use" : "Add"} ${c.name}`}>
                        {current ? "Use" : "Add"}
                      </Button>
                    )
                  }
                />
              ))}
            </Stack>
          )}
          {others.length === 0 && !current && (
            <Text size="xs" tone="subtle">
              The project has no credentials for {target} with {where.toLowerCase()} values.
            </Text>
          )}
          {onNew && (
            <span>
              <Button variant="outline-primary" size="xs" icon={Plus} onClick={onNew}>
                New credential
              </Button>
            </span>
          )}
        </>
      )}
    </Stack>
  );
}
